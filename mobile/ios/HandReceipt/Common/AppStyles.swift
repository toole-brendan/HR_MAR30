import SwiftUI

// MARK: - Font Definitions
public struct AppFonts {
    // Define standard sizes
    static let bodySize: CGFloat = 16
    static let headlineSize: CGFloat = 18
    static let subheadlineSize: CGFloat = 14
    static let captionSize: CGFloat = 12

    // Define Helvetica Neue fonts
    public static let body = Font.custom("HelveticaNeue", size: bodySize)
    public static let bodyBold = Font.custom("HelveticaNeue-Bold", size: bodySize)
    public static let headline = Font.custom("HelveticaNeue-Medium", size: headlineSize) // Medium weight for headlines
    public static let subheadline = Font.custom("HelveticaNeue", size: subheadlineSize)
    public static let subheadlineBold = Font.custom("HelveticaNeue-Bold", size: subheadlineSize)
    public static let caption = Font.custom("HelveticaNeue", size: captionSize)
    public static let captionMedium = Font.custom("HelveticaNeue-Medium", size: captionSize)
    public static let captionBold = Font.custom("HelveticaNeue-Bold", size: captionSize)

    // Add other weights/styles as needed (e.g., Light, Italic)
    // Example: public static let bodyLight = Font.custom("HelveticaNeue-Light", size: bodySize)
}

// Make the struct public so it can be accessed across the module
public struct PrimaryButtonStyle: ButtonStyle {
    public init() {} // Add a public initializer
    
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(.horizontal, 18) // Slightly adjusted padding
            .padding(.vertical, 10)
            .font(AppFonts.headline) // Use custom Helvetica Neue headline
            .foregroundColor(.white) // White text for contrast with the accent color
            .background(AppColors.accent) // Use our custom accent color
            .cornerRadius(4) // Reduced corner radius for a sharper look
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

// MARK: - Text Field Style

public struct IndustrialTextFieldStyle: TextFieldStyle {
    public init() {} // Public initializer

    public func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(.vertical, 10)
            .padding(.horizontal, 12)
            .font(AppFonts.body) // Use custom Helvetica Neue body
            .foregroundColor(AppColors.primaryText) // Use light text color
            .background(AppColors.secondaryBackground) // Use slightly lighter dark background
            .cornerRadius(4) // Match button corner radius
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(AppColors.secondaryText.opacity(0.5), lineWidth: 1) // Subtle border
            )
            // Add placeholder text color customization if needed
            // .placeholder(when: text.isEmpty) { // Requires a binding usually passed in
            //     Text("Placeholder").foregroundColor(AppColors.secondaryText) 
            // }
    }
}

extension TextFieldStyle where Self == IndustrialTextFieldStyle {
    public static var industrial: IndustrialTextFieldStyle {
        IndustrialTextFieldStyle()
    }
}


// MARK: - View Modifiers

public struct StandardContainerPadding: ViewModifier {
    public init() {} // Public initializer

    public func body(content: Content) -> some View {
        content
            .padding(.horizontal) // Standard horizontal padding
            .padding(.vertical, 10) // Standard vertical padding
    }
}

extension View {
    public func standardContainerPadding() -> some View {
        self.modifier(StandardContainerPadding())
    }
} 