import SwiftUI

// Make the struct public so it can be accessed across the module
public struct AppColors {
    // Background Colors
    public static let appBackground = Color(hex: "F2F2F7") ?? Color(.systemGray6)
    public static let secondaryBackground = Color(hex: "E5E5EA") ?? Color(.systemGray5)

    // Text Colors
    public static let primaryText = Color(hex: "1C1C1E") ?? Color(.label) // Provide fallback for potential init failure
    public static let secondaryText = Color(hex: "8E8E93") ?? Color(.secondaryLabel)

    // Accent Colors
    public static let accent = Color(hex: "587FA8") ?? Color.blue // Fallback to system blue
    public static let destructive = Color.red
}

// Helper extension to initialize Color from hex string
// Ensures the hex string is valid and parses correctly.
extension Color {
    init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0

        // Use Scanner to parse the hex string into a 64-bit unsigned integer.
        guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else {
            // Return nil if the hex string is invalid.
            return nil
        }

        // Ensure we handle both 6-digit (RRGGBB) and 8-digit (AARRGGBB/RRGGBBAA) hex formats if needed.
        // This implementation assumes 6-digit RRGGBB.
        // For 8-digit with alpha first (AARRGGBB):
        // let alpha = Double((rgb & 0xFF000000) >> 24) / 255.0
        // let red = Double((rgb & 0x00FF0000) >> 16) / 255.0
        // let green = Double((rgb & 0x0000FF00) >> 8) / 255.0
        // let blue = Double(rgb & 0x000000FF) / 255.0
        // self.init(.sRGB, red: red, green: green, blue: blue, opacity: alpha)

        // Current implementation for 6-digit RRGGBB:
        let red = Double((rgb & 0xFF0000) >> 16) / 255.0
        let green = Double((rgb & 0x00FF00) >> 8) / 255.0
        let blue = Double(rgb & 0x0000FF) / 255.0

        // Initialize the Color with the extracted RGB values.
        self.init(red: red, green: green, blue: blue)
    }
} 