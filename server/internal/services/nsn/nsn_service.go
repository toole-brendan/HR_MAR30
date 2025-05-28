package nsn

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/patrickmn/go-cache"
	"github.com/sirupsen/logrus"
	"github.com/toole-brendan/handreceipt-go/internal/config"
	"github.com/toole-brendan/handreceipt-go/internal/models"
	"gorm.io/gorm"
)

type NSNService struct {
	config      *config.NSNConfig
	cache       *cache.Cache
	db          *gorm.DB
	httpClient  *http.Client
	logger      *logrus.Logger
	rateLimiter chan struct{}
}

type NSNDetails struct {
	NSN          string            `json:"nsn"`
	LIN          string            `json:"lin"`
	Nomenclature string            `json:"nomenclature"`
	FSC          string            `json:"fsc"`
	NIIN         string            `json:"niin"`
	UnitPrice    float64           `json:"unit_price"`
	Manufacturer string            `json:"manufacturer"`
	PartNumber   string            `json:"part_number"`
	Specs        map[string]string `json:"specifications"`
	LastUpdated  time.Time         `json:"last_updated"`
}

type NSNAPIResponse struct {
	Success bool       `json:"success"`
	Data    NSNDetails `json:"data"`
	Error   string     `json:"error,omitempty"`
}

type BulkNSNAPIResponse struct {
	Success bool                  `json:"success"`
	Data    map[string]NSNDetails `json:"data"`
	Errors  map[string]string     `json:"errors,omitempty"`
}

type NSNRepository interface {
	GetByNSN(ctx context.Context, nsn string) (*models.NSNData, error)
	GetByLIN(ctx context.Context, lin string) (*models.NSNData, error)
	Save(ctx context.Context, nsnData *models.NSNData) error
	BulkSave(ctx context.Context, nsnDataList []*models.NSNData) error
	Search(ctx context.Context, query string, limit int) ([]*models.NSNData, error)
	GetAll(ctx context.Context, limit, offset int) ([]*models.NSNData, int64, error)
	DeleteOld(ctx context.Context, olderThan time.Time) error
}

type nsnRepository struct {
	db *gorm.DB
}

func NewNSNRepository(db *gorm.DB) NSNRepository {
	return &nsnRepository{db: db}
}

func (r *nsnRepository) GetByNSN(ctx context.Context, nsn string) (*models.NSNData, error) {
	var nsnData models.NSNData
	err := r.db.WithContext(ctx).Where("nsn = ?", nsn).First(&nsnData).Error
	if err != nil {
		return nil, err
	}
	return &nsnData, nil
}

func (r *nsnRepository) GetByLIN(ctx context.Context, lin string) (*models.NSNData, error) {
	var nsnData models.NSNData
	err := r.db.WithContext(ctx).Where("lin = ?", lin).First(&nsnData).Error
	if err != nil {
		return nil, err
	}
	return &nsnData, nil
}

func (r *nsnRepository) Save(ctx context.Context, nsnData *models.NSNData) error {
	return r.db.WithContext(ctx).Save(nsnData).Error
}

func (r *nsnRepository) BulkSave(ctx context.Context, nsnDataList []*models.NSNData) error {
	return r.db.WithContext(ctx).CreateInBatches(nsnDataList, 100).Error
}

func (r *nsnRepository) Search(ctx context.Context, query string, limit int) ([]*models.NSNData, error) {
	var results []*models.NSNData
	err := r.db.WithContext(ctx).
		Where("nsn ILIKE ? OR lin ILIKE ? OR nomenclature ILIKE ? OR manufacturer ILIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%").
		Limit(limit).
		Find(&results).Error
	return results, err
}

func (r *nsnRepository) GetAll(ctx context.Context, limit, offset int) ([]*models.NSNData, int64, error) {
	var results []*models.NSNData
	var total int64

	err := r.db.WithContext(ctx).Model(&models.NSNData{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.WithContext(ctx).Limit(limit).Offset(offset).Find(&results).Error
	return results, total, err
}

func (r *nsnRepository) DeleteOld(ctx context.Context, olderThan time.Time) error {
	return r.db.WithContext(ctx).Where("last_updated < ?", olderThan).Delete(&models.NSNData{}).Error
}

func NewNSNService(cfg *config.NSNConfig, db *gorm.DB, logger *logrus.Logger) *NSNService {
	// Initialize cache
	var cacheInstance *cache.Cache
	if cfg.CacheEnabled {
		cacheInstance = cache.New(cfg.CacheTTL, cfg.CacheTTL*2)
	}

	// Initialize HTTP client with timeout
	httpClient := &http.Client{
		Timeout: time.Duration(cfg.TimeoutSeconds) * time.Second,
	}

	// Initialize rate limiter
	rateLimiter := make(chan struct{}, cfg.RateLimitRPS)
	for i := 0; i < cfg.RateLimitRPS; i++ {
		rateLimiter <- struct{}{}
	}

	// Start rate limiter refill goroutine
	go func() {
		ticker := time.NewTicker(time.Second / time.Duration(cfg.RateLimitRPS))
		defer ticker.Stop()
		for range ticker.C {
			select {
			case rateLimiter <- struct{}{}:
			default:
			}
		}
	}()

	return &NSNService{
		config:      cfg,
		cache:       cacheInstance,
		db:          db,
		httpClient:  httpClient,
		logger:      logger,
		rateLimiter: rateLimiter,
	}
}

// LookupNSN performs NSN lookup with caching and fallback to external API
func (s *NSNService) LookupNSN(ctx context.Context, nsn string) (*NSNDetails, error) {
	// Validate NSN format
	if len(nsn) != 13 {
		return nil, fmt.Errorf("invalid NSN format: must be 13 characters")
	}

	// Check cache first
	if s.config.CacheEnabled && s.cache != nil {
		if cached, found := s.cache.Get(nsn); found {
			s.logger.WithField("nsn", nsn).Debug("NSN found in cache")
			return cached.(*NSNDetails), nil
		}
	}

	// Check local database
	repo := NewNSNRepository(s.db)
	if dbData, err := repo.GetByNSN(ctx, nsn); err == nil {
		details := s.convertFromModel(dbData)

		// Update cache
		if s.config.CacheEnabled && s.cache != nil {
			s.cache.Set(nsn, details, cache.DefaultExpiration)
		}

		s.logger.WithField("nsn", nsn).Debug("NSN found in database")
		return details, nil
	}

	// Fetch from external API if configured
	if s.config.APIEndpoint != "" {
		details, err := s.fetchFromAPI(ctx, nsn)
		if err != nil {
			s.logger.WithError(err).WithField("nsn", nsn).Warn("Failed to fetch NSN from API")
			return nil, fmt.Errorf("failed to fetch NSN %s: %w", nsn, err)
		}

		// Store in database
		modelData := s.convertToModel(details)
		if err := repo.Save(ctx, modelData); err != nil {
			s.logger.WithError(err).WithField("nsn", nsn).Warn("Failed to save NSN to database")
		}

		// Update cache
		if s.config.CacheEnabled && s.cache != nil {
			s.cache.Set(nsn, details, cache.DefaultExpiration)
		}

		s.logger.WithField("nsn", nsn).Info("NSN fetched from external API")
		return details, nil
	}

	return nil, fmt.Errorf("NSN %s not found", nsn)
}

// LookupLIN performs LIN lookup
func (s *NSNService) LookupLIN(ctx context.Context, lin string) (*NSNDetails, error) {
	// Validate LIN format
	if len(lin) != 6 {
		return nil, fmt.Errorf("invalid LIN format: must be 6 characters")
	}

	// Check cache first
	cacheKey := "lin:" + lin
	if s.config.CacheEnabled && s.cache != nil {
		if cached, found := s.cache.Get(cacheKey); found {
			s.logger.WithField("lin", lin).Debug("LIN found in cache")
			return cached.(*NSNDetails), nil
		}
	}

	// Check local database
	repo := NewNSNRepository(s.db)
	if dbData, err := repo.GetByLIN(ctx, lin); err == nil {
		details := s.convertFromModel(dbData)

		// Update cache
		if s.config.CacheEnabled && s.cache != nil {
			s.cache.Set(cacheKey, details, cache.DefaultExpiration)
		}

		s.logger.WithField("lin", lin).Debug("LIN found in database")
		return details, nil
	}

	return nil, fmt.Errorf("LIN %s not found", lin)
}

// BulkLookup performs bulk NSN lookup
func (s *NSNService) BulkLookup(ctx context.Context, nsns []string) (map[string]*NSNDetails, error) {
	if len(nsns) > s.config.BulkBatchSize {
		return nil, fmt.Errorf("bulk lookup size exceeds limit of %d", s.config.BulkBatchSize)
	}

	results := make(map[string]*NSNDetails)
	notFound := make([]string, 0)
	mu := sync.Mutex{}

	// Check cache and database first
	for _, nsn := range nsns {
		// Check cache
		if s.config.CacheEnabled && s.cache != nil {
			if cached, found := s.cache.Get(nsn); found {
				mu.Lock()
				results[nsn] = cached.(*NSNDetails)
				mu.Unlock()
				continue
			}
		}

		// Check database
		repo := NewNSNRepository(s.db)
		if dbData, err := repo.GetByNSN(ctx, nsn); err == nil {
			details := s.convertFromModel(dbData)
			mu.Lock()
			results[nsn] = details
			mu.Unlock()

			// Update cache
			if s.config.CacheEnabled && s.cache != nil {
				s.cache.Set(nsn, details, cache.DefaultExpiration)
			}
		} else {
			notFound = append(notFound, nsn)
		}
	}

	// Fetch missing NSNs from API if configured
	if len(notFound) > 0 && s.config.APIEndpoint != "" {
		apiResults, err := s.bulkFetchFromAPI(ctx, notFound)
		if err != nil {
			s.logger.WithError(err).Warn("Bulk API fetch failed")
		} else {
			// Store results
			var modelsToSave []*models.NSNData
			for nsn, details := range apiResults {
				mu.Lock()
				results[nsn] = details
				mu.Unlock()

				// Prepare for bulk save
				modelsToSave = append(modelsToSave, s.convertToModel(details))

				// Update cache
				if s.config.CacheEnabled && s.cache != nil {
					s.cache.Set(nsn, details, cache.DefaultExpiration)
				}
			}

			// Bulk save to database
			if len(modelsToSave) > 0 {
				repo := NewNSNRepository(s.db)
				if err := repo.BulkSave(ctx, modelsToSave); err != nil {
					s.logger.WithError(err).Warn("Failed to bulk save NSN data")
				}
			}
		}
	}

	return results, nil
}

// SearchNSN searches for NSN data by query
func (s *NSNService) SearchNSN(ctx context.Context, query string, limit int) ([]*NSNDetails, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	repo := NewNSNRepository(s.db)
	dbResults, err := repo.Search(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	results := make([]*NSNDetails, len(dbResults))
	for i, dbData := range dbResults {
		results[i] = s.convertFromModel(dbData)
	}

	return results, nil
}

// RefreshCachedNSNData refreshes cached NSN data from external API
func (s *NSNService) RefreshCachedNSNData(ctx context.Context) error {
	if s.config.APIEndpoint == "" {
		s.logger.Info("No API endpoint configured, skipping NSN data refresh")
		return nil
	}

	s.logger.Info("Starting NSN data refresh")

	// Get all NSNs from database
	repo := NewNSNRepository(s.db)
	allData, _, err := repo.GetAll(ctx, 1000, 0) // Process in batches
	if err != nil {
		return fmt.Errorf("failed to get NSN data for refresh: %w", err)
	}

	// Extract NSNs
	nsns := make([]string, len(allData))
	for i, data := range allData {
		nsns[i] = data.NSN
	}

	// Process in batches
	batchSize := s.config.BulkBatchSize
	for i := 0; i < len(nsns); i += batchSize {
		end := i + batchSize
		if end > len(nsns) {
			end = len(nsns)
		}

		batch := nsns[i:end]
		_, err := s.BulkLookup(ctx, batch)
		if err != nil {
			s.logger.WithError(err).WithField("batch", i/batchSize).Warn("Failed to refresh NSN batch")
		}

		// Rate limiting between batches
		time.Sleep(time.Second)
	}

	s.logger.Info("NSN data refresh completed")
	return nil
}

// fetchFromAPI fetches NSN data from external API
func (s *NSNService) fetchFromAPI(ctx context.Context, nsn string) (*NSNDetails, error) {
	// Rate limiting
	select {
	case <-s.rateLimiter:
	case <-ctx.Done():
		return nil, ctx.Err()
	}

	url := fmt.Sprintf("%s/nsn/%s", s.config.APIEndpoint, nsn)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	if s.config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+s.config.APIKey)
	}

	var response NSNAPIResponse
	for attempt := 0; attempt < s.config.RetryAttempts; attempt++ {
		resp, err := s.httpClient.Do(req)
		if err != nil {
			if attempt == s.config.RetryAttempts-1 {
				return nil, err
			}
			time.Sleep(time.Duration(attempt+1) * time.Second)
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			if attempt == s.config.RetryAttempts-1 {
				return nil, fmt.Errorf("API request failed with status %d", resp.StatusCode)
			}
			time.Sleep(time.Duration(attempt+1) * time.Second)
			continue
		}

		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			return nil, err
		}

		if !response.Success {
			return nil, fmt.Errorf("API error: %s", response.Error)
		}

		response.Data.LastUpdated = time.Now()
		return &response.Data, nil
	}

	return nil, fmt.Errorf("max retry attempts exceeded")
}

// bulkFetchFromAPI fetches multiple NSNs from external API
func (s *NSNService) bulkFetchFromAPI(ctx context.Context, nsns []string) (map[string]*NSNDetails, error) {
	// Rate limiting
	select {
	case <-s.rateLimiter:
	case <-ctx.Done():
		return nil, ctx.Err()
	}

	url := fmt.Sprintf("%s/nsn/bulk", s.config.APIEndpoint)
	payload := map[string][]string{"nsns": nsns}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, strings.NewReader(string(jsonData)))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if s.config.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+s.config.APIKey)
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("bulk API request failed with status %d", resp.StatusCode)
	}

	var response BulkNSNAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	if !response.Success {
		return nil, fmt.Errorf("bulk API error")
	}

	// Update timestamps
	results := make(map[string]*NSNDetails)
	for nsn, details := range response.Data {
		details.LastUpdated = time.Now()
		results[nsn] = &details
	}

	return results, nil
}

// convertFromModel converts database model to service model
func (s *NSNService) convertFromModel(data *models.NSNData) *NSNDetails {
	specs := make(map[string]string)
	if data.Specifications != nil {
		for k, v := range data.Specifications {
			if str, ok := v.(string); ok {
				specs[k] = str
			}
		}
	}

	return &NSNDetails{
		NSN:          data.NSN,
		LIN:          data.LIN,
		Nomenclature: data.Nomenclature,
		FSC:          data.FSC,
		NIIN:         data.NIIN,
		UnitPrice:    data.UnitPrice,
		Manufacturer: data.Manufacturer,
		PartNumber:   data.PartNumber,
		Specs:        specs,
		LastUpdated:  data.LastUpdated,
	}
}

// convertToModel converts service model to database model
func (s *NSNService) convertToModel(details *NSNDetails) *models.NSNData {
	specs := make(map[string]interface{})
	for k, v := range details.Specs {
		specs[k] = v
	}

	return &models.NSNData{
		NSN:            details.NSN,
		LIN:            details.LIN,
		Nomenclature:   details.Nomenclature,
		FSC:            details.FSC,
		NIIN:           details.NIIN,
		UnitPrice:      details.UnitPrice,
		Manufacturer:   details.Manufacturer,
		PartNumber:     details.PartNumber,
		Specifications: specs,
		LastUpdated:    details.LastUpdated,
	}
}

// ClearCache clears the NSN cache
func (s *NSNService) ClearCache() {
	if s.config.CacheEnabled && s.cache != nil {
		s.cache.Flush()
		s.logger.Info("NSN cache cleared")
	}
}

// GetCacheStats returns cache statistics
func (s *NSNService) GetCacheStats() map[string]interface{} {
	if !s.config.CacheEnabled || s.cache == nil {
		return map[string]interface{}{"enabled": false}
	}

	return map[string]interface{}{
		"enabled":      true,
		"item_count":   s.cache.ItemCount(),
		"cache_hits":   "not_tracked", // go-cache doesn't track hits by default
		"cache_misses": "not_tracked",
	}
}
