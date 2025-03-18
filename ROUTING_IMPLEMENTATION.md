# Frontend Routing Implementation Guide

## Overview

This document explains the routing implementation of our application, focusing on:

1. The base URL configuration (`/defense`)
2. Dashboard implementation as the landing page
3. How routing is managed across all pages
4. Client-side and server-side coordination for seamless navigation

## Base URL Implementation

The application uses `/defense` as its base URL path for all routes. This is implemented through coordinated server-side and client-side configurations.

### Key Components:

```
Frontend Base URL: /defense
API Base URL: /defense/api (redirected to /api internally)
Dashboard URL: /defense or /defense/ or /defense/dashboard
```

## Server-Side Implementation

### Express Server Configuration

The server configuration handles routing through middleware:

```javascript
// Redirect non-base paths to the base path
app.use("*", (req, res, next) => {
  if (!req.originalUrl.startsWith("/defense") && !req.originalUrl.startsWith("/api")) {
    return res.redirect(`/defense${req.originalUrl === "/" ? "" : req.originalUrl}`);
  }
  // ...
});

// Serve static files with the base path prefix
app.use('/defense', express.static(distPath));

// Explicit root redirection
app.use("/", (req, res) => {
  res.redirect("/defense");
});
```

### API Path Handling

The server handles API requests by rewriting the URL:

```javascript
// Rewrite defense-prefixed API requests to standard API path
app.use('/defense/api/*', (req, res, next) => {
  req.url = req.url.replace('/defense/api', '/api');
  next();
});
```

## Client-Side Implementation

### Centralized Base Path Configuration

The base path is defined in a single location:

```javascript
// In queryClient.ts
export const BASE_PATH = "/defense";
```

### Route Configuration

All routes are configured to include the base path:

```javascript
// In App.tsx
function Router() {
  const basePath = BASE_PATH;
  
  return (
    <AppShell>
      <Switch>
        <Route path={`${basePath}`} component={() => <Dashboard />} />
        <Route path={`${basePath}/`} component={() => <Dashboard />} />
        <Route path={`${basePath}/dashboard`} component={() => <Dashboard />} />
        {/* Other routes with basePath prefix */}
        <Route path={`${basePath}/*`} component={() => <NotFound />} />
      </Switch>
    </AppShell>
  );
}
```

### URL Utility Functions

Helper functions ensure all navigation maintains the correct path structure:

```javascript
// In navigation.ts
export function getNavigationPath(path: string): string {
  // If it already includes the base path, return as is
  if (path.startsWith('http') || path.includes(BASE_PATH)) {
    return path;
  }
  
  // Format and return with base path
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${formattedPath}`;
}
```

### API Request URL Handling

API requests are preprocessed to include the base path:

```javascript
// In queryClient.ts
export function getFullUrl(url: string): string {
  // Handle different URL types
  if (url.startsWith('http') || url.startsWith(BASE_PATH)) {
    return url;
  }
  
  if (url.startsWith('/api')) {
    return `${BASE_PATH}${url}`;
  }
  
  return `${BASE_PATH}${url.startsWith('/') ? url : `/${url}`}`;
}
```

## Dashboard as Landing Page

The Dashboard is implemented as the landing page through:

1. Multiple route definitions at the base path:
   ```javascript
   <Route path={`${basePath}`} component={() => <Dashboard />} />
   <Route path={`${basePath}/`} component={() => <Dashboard />} />
   <Route path={`${basePath}/dashboard`} component={() => <Dashboard />} />
   ```

2. Client-side redirection for root access:
   ```javascript
   useEffect(() => {
     const path = window.location.pathname;
     if (path === '/' || path === '') {
       window.history.replaceState(null, "", `${BASE_PATH}`);
     }
   }, []);
   ```

3. Server-side redirection:
   ```javascript
   app.use("/", (req, res) => {
     res.redirect("/defense");
   });
   ```

## Why This Routing Implementation Works

This routing implementation is robust for several reasons:

1. **Single Source of Truth**: The base path is defined in one place (`BASE_PATH` constant)

2. **Consistent Path Handling**: All navigation, links and API calls use utility functions:
   - `getNavigationPath()` for client navigation
   - `getFullUrl()` for API requests

3. **Bidirectional Path Enforcement**:
   - Server redirects non-base paths to base path
   - Client ensures all navigation maintains base path

4. **Complete Route Coverage**:
   - All routes properly prefixed with base path
   - Catch-all route for 404 handling

5. **API Path Normalization**:
   - `/defense/api/*` paths are internally rewritten to `/api/*`
   - Client automatically adds `/defense` prefix to API calls

## Implementation Checklist

To implement this routing structure in your own application:

1. **Define a centralized base path constant** (e.g., `BASE_PATH = "/your-base-path"`)

2. **Configure server-side redirects and static serving**:
   - Redirect root and non-base paths to the base path
   - Serve static assets with the base path prefix
   - Rewrite API paths if needed

3. **Configure client-side routing**:
   - Prefix all routes with the base path
   - Create utility functions for navigation and API calls
   - Implement client-side redirection for direct URL access

4. **Set up the landing page**:
   - Define multiple routes for the landing page (with and without trailing slash)
   - Ensure 404 handling with a catch-all route

5. **Test all navigation scenarios**:
   - Direct URL access
   - Internal link navigation
   - API requests
   - Browser back/forward navigation

## Common Routing Issues and Solutions

### 1. Direct URL Access Breaks Navigation

**Problem**: Users directly typing URLs or using bookmarks bypass client-side routing logic.

**Solution**: 
- Server-side catch-all route that serves `index.html` for all frontend routes
- Client-side initialization code that handles direct URL access

### 2. API Calls Not Finding the Correct Endpoint

**Problem**: API calls need to be prefixed with the base path when sent from the browser.

**Solution**:
- Centralized API request function that automatically adds the base path
- Server-side rewriting of `/defense/api/*` to `/api/*`

### 3. Links Not Maintaining Base Path

**Problem**: Internal links might ignore the base path, causing navigation issues.

**Solution**:
- Utility function (`getNavigationPath()`) for all internal links
- Custom click handler to intercept regular links and add the base path

### 4. Browser History and Navigation Controls

**Problem**: Forward/back navigation might break when base path isn't consistently applied.

**Solution**:
- History API manipulation to ensure state includes base path
- Consistent use of routing library (Wouter in this case) for all navigation

## Conclusion

This routing implementation provides a robust foundation for applications that need to operate under a sub-path rather than at the domain root. The coordinated client-side and server-side approach ensures consistent navigation behavior under all circumstances.
