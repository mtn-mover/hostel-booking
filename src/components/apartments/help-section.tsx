'use client'

export function HelpSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
      <h3 className="font-semibold mb-3">Need Help?</h3>
      <p className="text-sm text-gray-600 mb-3">
        Our team is here to help you with your booking.
      </p>
      <button
        onClick={() => {
          // Open the chat widget using the global function
          if ((window as any).openChatWidget) {
            (window as any).openChatWidget();
          }
        }}
        className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
      >
        <span className="mr-2">💬</span>
        Open Chat Support
      </button>
    </div>
  )
}