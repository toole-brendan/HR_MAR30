import SwiftUI

// Make the struct public so it can be accessed across the module
public struct PrimaryButtonStyle: ButtonStyle {
    public init() {} // Add a public initializer
    
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .font(.headline) // Or .body.weight(.semibold)
            .foregroundColor(.white) // White text for contrast with the accent color
            .background(AppColors.accent) // Use our custom accent color
            .cornerRadius(8) // Slightly rounded corners
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0) // Subtle press effect
            .opacity(configuration.isPressed ? 0.9 : 1.0) // Slightly dim on press
    }
}

// Optional: Add extension for easier usage
extension ButtonStyle where Self == PrimaryButtonStyle {
    public static var primary: PrimaryButtonStyle {
        PrimaryButtonStyle()
    }
} 