// ==================================================
// WEBSOCKET DIAGNOSTIC SCRIPT
// Run this in Browser Console (F12) to diagnose issues
// ==================================================

console.log('%c=== WebSocket Diagnostic Tool ===', 'color: blue; font-size: 16px; font-weight: bold');
console.log('');

// 1. Check User Authentication
console.log('%c[1/7] Checking Authentication...', 'color: orange; font-weight: bold');
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');

if (!userStr) {
    console.error('❌ No user found in localStorage. Please login first!');
} else {
    const user = JSON.parse(userStr);
    console.log('✅ User authenticated:', user.username, '(ID:', user.id + ')');
    console.log('✅ Token exists:', !!token);
}
console.log('');

// 2. Check WebSocket Service
console.log('%c[2/7] Checking WebSocket Service...', 'color: orange; font-weight: bold');
if (typeof websocketService === 'undefined') {
    console.error('❌ websocketService is not defined!');
    console.log('Try: import { websocketService } from "@/lib/services/websocketService"');
} else {
    console.log('✅ websocketService is available');
    console.log('Connection status:', websocketService.isConnected() ? '✅ Connected' : '❌ Not connected');
}
console.log('');

// 3. Check Backend Connection
console.log('%c[3/7] Checking Backend...', 'color: orange; font-weight: bold');
fetch('http://localhost:8080/api/auth/login', { method: 'OPTIONS' })
    .then(() => console.log('✅ Backend is reachable at http://localhost:8080'))
    .catch(e => console.error('❌ Backend is not reachable:', e.message));
console.log('');

// 4. Test WebSocket Connection
console.log('%c[4/7] Testing WebSocket Connection...', 'color: orange; font-weight: bold');
if (userStr && typeof websocketService !== 'undefined') {
    const user = JSON.parse(userStr);
    if (!websocketService.isConnected()) {
        console.log('🔄 Attempting to connect...');
        websocketService.connect(user.id);
        setTimeout(() => {
            console.log('Connection status after 3 seconds:',
                websocketService.isConnected() ? '✅ Connected' : '❌ Still not connected');
        }, 3000);
    } else {
        console.log('✅ Already connected');
    }
} else {
    console.warn('⚠️  Skipping - no user or websocketService unavailable');
}
console.log('');

// 5. Provide Manual Send Function
console.log('%c[5/7] Manual Send Test Function', 'color: orange; font-weight: bold');
console.log('Run this to test sending a message:');
console.log('');
console.log('%ctestSendMessage(receiverId)', 'color: green; font-family: monospace');
console.log('');
console.log('Example: testSendMessage(2)  // Send to user with ID 2');
console.log('');

window.testSendMessage = function(receiverId) {
    console.log('%c=== TEST SEND MESSAGE ===', 'color: blue; font-weight: bold');

    if (!userStr) {
        console.error('❌ Not logged in!');
        return;
    }

    if (typeof websocketService === 'undefined') {
        console.error('❌ websocketService not available!');
        return;
    }

    if (!websocketService.isConnected()) {
        console.error('❌ WebSocket not connected!');
        console.log('Try: websocketService.connect(' + JSON.parse(userStr).id + ')');
        return;
    }

    const user = JSON.parse(userStr);
    const testMessage = {
        senderId: user.id,
        receiverId: receiverId,
        content: 'Diagnostic test message at ' + new Date().toLocaleTimeString(),
        messageType: 'TEXT'
    };

    console.log('📤 Sending test message:', testMessage);
    websocketService.sendMessage(testMessage);
    console.log('✅ Message sent!');
    console.log('');
    console.log('👉 NOW CHECK BACKEND CONSOLE FOR:');
    console.log('   "=== WebSocket Message Received ==="');
    console.log('');
    console.log('If backend shows the log → Fix is working! 🎉');
    console.log('If NO log → @MessageMapping still broken');
};

// 6. Subscribe to all messages
console.log('%c[6/7] Setting up Message Listener...', 'color: orange; font-weight: bold');
if (typeof websocketService !== 'undefined') {
    websocketService.onMessage((msg) => {
        console.log('%c📨 MESSAGE RECEIVED:', 'color: green; font-weight: bold');
        console.log(msg);
    });
    console.log('✅ Listening for all incoming messages');
} else {
    console.warn('⚠️  websocketService not available');
}
console.log('');

// 7. Summary
console.log('%c[7/7] Diagnostic Summary', 'color: orange; font-weight: bold');
console.log('');
console.log('✅ TO TEST THE FIX:');
console.log('   1. Make sure you are logged in');
console.log('   2. Make sure WebSocket is connected');
console.log('   3. Run: testSendMessage(friendUserId)');
console.log('   4. Check backend console immediately');
console.log('   5. If backend logs "=== WebSocket Message Received ===" → SUCCESS!');
console.log('');
console.log('❌ IF BACKEND DOES NOT LOG:');
console.log('   - Restart backend');
console.log('   - Check backend console for errors');
console.log('   - Verify @MessageMapping fix was applied');
console.log('   - See CRITICAL_FIX.md for details');
console.log('');
console.log('%cDiagnostics complete!', 'color: blue; font-size: 14px; font-weight: bold');
console.log('');

// Export for convenience
window.wsCheck = function() {
    console.log('WebSocket connected:', websocketService.isConnected());
    console.log('Current user:', JSON.parse(localStorage.getItem('user')));
};

console.log('💡 TIP: Run wsCheck() anytime to check status');
console.log('💡 TIP: Run testSendMessage(friendId) to test sending');

