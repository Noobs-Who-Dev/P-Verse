package com.app.pverse;

import com.app.pverse.dto.UserSearchDto;
import com.app.pverse.entity.User;
import com.app.pverse.repository.UserRepository;
import com.app.pverse.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Scanner;

@SpringBootApplication
class PverseApplication {

    public static void main(String[] args) {
        SpringApplication.run(PverseApplication.class, args);
    }

//    @Bean
//    public CommandLineRunner friendTestRunner(FriendTestConsole console) {
//        return args -> {
//            console.start();
//        };
//    }
}

@Component
@RequiredArgsConstructor
class FriendTestConsole {

    private final FriendService friendService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private Scanner scanner;
    private Long currentUserId;

    public void start() {
        scanner = new Scanner(System.in);

        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║   P-VERSE FRIEND SERVICE TEST TOOL   ║");
        System.out.println("╚════════════════════════════════════════╝\n");

        // Tạo test users nếu chưa có
        initializeTestUsers();

        // Login
        login();

        // Main menu loop
        while (true) {
            showMenu();
            String choice = scanner.nextLine().trim();

            try {
                switch (choice) {
                    case "1" -> searchUsers();
                    case "2" -> toggleFriendRequest();
                    case "3" -> viewFriends();
                    case "4" -> viewReceivedRequests();
                    case "5" -> viewSentRequests();
                    case "6" -> acceptRequest();
                    case "7" -> rejectRequest();
                    case "8" -> unfriend();
                    case "9" -> switchUser();
                    case "0" -> {
                        System.out.println("\n👋 Goodbye!");
                        System.exit(0);
                    }
                    default -> System.out.println("❌ Invalid choice. Please try again.");
                }
            } catch (Exception e) {
                System.out.println("❌ Error: " + e.getMessage());
                e.printStackTrace();
            }

            System.out.println("\nPress Enter to continue...");
            scanner.nextLine();
        }
    }

    private void initializeTestUsers() {
        System.out.println("📦 Initializing test users...");

        String[][] testUsers = {
                {"alice", "alice@pverse.com", "Alice Smith"},
                {"bob", "bob@pverse.com", "Bob Johnson"},
                {"charlie", "charlie@pverse.com", "Charlie Brown"},
                {"diana", "diana@pverse.com", "Diana Prince"},
                {"eve", "eve@pverse.com", "Eve Wilson"}
        };

        for (String[] userData : testUsers) {
            String username = userData[0];
            String email = userData[1];
            String displayName = userData[2];

            // ✅ FIX: Kiểm tra cả username VÀ email
            if (!userRepository.existsByUsername(username) &&
                    !userRepository.existsByEmail(email)) {

                User user = User.builder()
                        .username(username)
                        .email(email)
                        .password(passwordEncoder.encode("password123"))
                        .displayName(displayName)
                        .bio("Test user: " + username)
                        .isOnline(false)
                        .build();

                userRepository.save(user);
                System.out.println("  ✅ Created user: " + username);
            } else {
                System.out.println("  ⏭️  User already exists: " + username);
            }
        }
        System.out.println("✅ Test users ready!\n");
    }

    private void login() {
        System.out.println("🔐 LOGIN");
        System.out.println("─────────────────────────────────");

        while (true) {
            System.out.print("Enter username: ");
            String username = scanner.nextLine().trim();

            User user = userRepository.findByUsername(username).orElse(null);

            if (user != null) {
                currentUserId = user.getId();
                System.out.println("✅ Logged in as: " + user.getDisplayName() + " (@" + username + ")");
                System.out.println("   User ID: " + currentUserId + "\n");
                break;
            } else {
                System.out.println("❌ User not found. Try: alice, bob, charlie, diana, or eve");
            }
        }
    }

    private void showMenu() {
        User currentUser = userRepository.findById(currentUserId).orElseThrow();

        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║           MAIN MENU                  ║");
        System.out.println("╠════════════════════════════════════════╣");
        System.out.println("║  Current User: " + String.format("%-23s", currentUser.getDisplayName()) + "║");
        System.out.println("╠════════════════════════════════════════╣");
        System.out.println("║  1. Search Users                     ║");
        System.out.println("║  2. Send/Cancel Friend Request       ║");
        System.out.println("║  3. View Friends List                ║");
        System.out.println("║  4. View Received Requests           ║");
        System.out.println("║  5. View Sent Requests               ║");
        System.out.println("║  6. Accept Friend Request            ║");
        System.out.println("║  7. Reject Friend Request            ║");
        System.out.println("║  8. Unfriend                         ║");
        System.out.println("║  9. Switch User                      ║");
        System.out.println("║  0. Exit                             ║");
        System.out.println("╚════════════════════════════════════════╝");
        System.out.print("\nYour choice: ");
    }


    private void searchUsers() {
        System.out.println("\n🔍 SEARCH USERS");
        System.out.println("─────────────────────────────────");
        System.out.print("Enter keyword (username/email/name): ");
        String keyword = scanner.nextLine().trim();

        if (keyword.isEmpty()) {
            System.out.println("❌ Keyword cannot be empty");
            return;
        }

        List<UserSearchDto> results = friendService.searchUsers(keyword, currentUserId);

        if (results.isEmpty()) {
            System.out.println("\n📭 No users found matching: " + keyword);
            return;
        }

        System.out.println("\n📋 Search Results (" + results.size() + " found):");
        System.out.println("════════════════════════════════════════════════════════════════════════");
        System.out.printf("%-5s %-15s %-25s %-20s %-15s%n",
                "ID", "Username", "Display Name", "Email", "Status");
        System.out.println("────────────────────────────────────────────────────────────────────────");

        for (UserSearchDto user : results) {
            String statusIcon = getStatusIcon(user.getFriendshipStatus());
            System.out.printf("%-5d %-15s %-25s %-20s %s %-8s%n",
                    user.getId(),
                    user.getUsername(),
                    truncate(user.getDisplayName(), 24),
                    truncate(user.getEmail(), 19),
                    statusIcon,
                    user.getFriendshipStatus()
            );
        }
        System.out.println("════════════════════════════════════════════════════════════════════════");
    }

    private void toggleFriendRequest() {
        System.out.println("\n➕ SEND/CANCEL FRIEND REQUEST");
        System.out.println("─────────────────────────────────");
        System.out.print("Enter target user ID: ");

        try {
            Long targetUserId = Long.parseLong(scanner.nextLine().trim());

            User targetUser = userRepository.findById(targetUserId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            System.out.println("Target: " + targetUser.getDisplayName() + " (@" + targetUser.getUsername() + ")");
            System.out.print("Confirm? (y/n): ");

            if (!scanner.nextLine().trim().equalsIgnoreCase("y")) {
                System.out.println("❌ Cancelled");
                return;
            }

            UserSearchDto.FriendshipStatusDto newStatus =
                    friendService.toggleFriendRequest(currentUserId, targetUserId);

            System.out.println("\n✅ Success!");
            System.out.println("   New Status: " + getStatusIcon(newStatus) + " " + newStatus);
            System.out.println("   " + getStatusMessage(newStatus));

        } catch (NumberFormatException e) {
            System.out.println("❌ Invalid user ID format");
        }
    }

    private void viewFriends() {
        System.out.println("\n👥 MY FRIENDS LIST");
        System.out.println("─────────────────────────────────");

        List<UserSearchDto> friends = friendService.getFriends(currentUserId);

        if (friends.isEmpty()) {
            System.out.println("📭 You have no friends yet. Search and add some!");
            return;
        }

        System.out.println("\n📋 Friends (" + friends.size() + "):");
        System.out.println("════════════════════════════════════════════════════════════════");
        System.out.printf("%-5s %-15s %-25s %-12s%n",
                "ID", "Username", "Display Name", "Online");
        System.out.println("────────────────────────────────────────────────────────────────");

        for (UserSearchDto friend : friends) {
            String onlineStatus = friend.getIsOnline() ? "🟢 Online" : "⚪ Offline";
            System.out.printf("%-5d %-15s %-25s %s%n",
                    friend.getId(),
                    friend.getUsername(),
                    truncate(friend.getDisplayName(), 24),
                    onlineStatus
            );
        }
        System.out.println("════════════════════════════════════════════════════════════════");
    }

    private void viewReceivedRequests() {
        System.out.println("\n📬 RECEIVED FRIEND REQUESTS");
        System.out.println("─────────────────────────────────");

        List<UserSearchDto> requests = friendService.getReceivedRequests(currentUserId);

        if (requests.isEmpty()) {
            System.out.println("📭 No pending friend requests");
            return;
        }

        System.out.println("\n📋 Pending Requests (" + requests.size() + "):");
        System.out.println("════════════════════════════════════════════════════════════════");
        System.out.printf("%-5s %-15s %-25s%n",
                "ID", "Username", "Display Name");
        System.out.println("────────────────────────────────────────────────────────────────");

        for (UserSearchDto request : requests) {
            System.out.printf("%-5d %-15s %-25s%n",
                    request.getId(),
                    request.getUsername(),
                    truncate(request.getDisplayName(), 24)
            );
        }
        System.out.println("════════════════════════════════════════════════════════════════");
        System.out.println("\n💡 Tip: Use option 2 to accept a request (toggle with their ID)");
    }

    private void unfriend() {
        System.out.println("\n💔 UNFRIEND");
        System.out.println("─────────────────────────────────");
        System.out.print("Enter friend user ID to unfriend: ");

        try {
            Long targetUserId = Long.parseLong(scanner.nextLine().trim());

            User targetUser = userRepository.findById(targetUserId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            System.out.println("Target: " + targetUser.getDisplayName() + " (@" + targetUser.getUsername() + ")");
            System.out.print("⚠️  Are you sure? (y/n): ");

            if (!scanner.nextLine().trim().equalsIgnoreCase("y")) {
                System.out.println("❌ Cancelled");
                return;
            }

            friendService.unfriend(currentUserId, targetUserId);
            System.out.println("\n✅ Unfriended successfully");

        } catch (NumberFormatException e) {
            System.out.println("❌ Invalid user ID format");
        }
    }

    private void switchUser() {
        System.out.println("\n🔄 SWITCH USER");
        System.out.println("─────────────────────────────────");
        login();
    }

    private String getStatusIcon(UserSearchDto.FriendshipStatusDto status) {
        return switch (status) {
            case FRIEND -> "✅";
            case PENDING_SENT -> "⏳";
            case PENDING_RECEIVED -> "📬";
            case STRANGER -> "👤";
            case BLOCKED -> "🚫";
        };
    }

    private String getStatusMessage(UserSearchDto.FriendshipStatusDto status) {
        return switch (status) {
            case PENDING_SENT -> "Friend request sent! Waiting for acceptance.";
            case STRANGER -> "Friend request cancelled.";
            case FRIEND -> "Friend request accepted! You are now friends.";
            default -> "Status updated.";
        };
    }

    private String truncate(String str, int maxLength) {
        if (str == null) return "";
        return str.length() > maxLength ? str.substring(0, maxLength - 2) + ".." : str;
    }

    private void viewSentRequests() {
        System.out.println("\n📤 SENT FRIEND REQUESTS");
        System.out.println("─────────────────────────────────");

        List<UserSearchDto> requests = friendService.getSentRequests(currentUserId);

        if (requests.isEmpty()) {
            System.out.println("📭 No sent friend requests");
            return;
        }

        System.out.println("\n📋 Pending Sent Requests (" + requests.size() + "):");
        System.out.println("════════════════════════════════════════════════════════════════");
        System.out.printf("%-5s %-15s %-25s%n",
                "ID", "Username", "Display Name");
        System.out.println("────────────────────────────────────────────────────────────────");

        for (UserSearchDto request : requests) {
            System.out.printf("%-5d %-15s %-25s%n",
                    request.getId(),
                    request.getUsername(),
                    truncate(request.getDisplayName(), 24)
            );
        }
        System.out.println("════════════════════════════════════════════════════════════════");
        System.out.println("\n💡 Tip: Use option 2 to cancel a sent request");
    }

    private void acceptRequest() {
        System.out.println("\n✅ ACCEPT FRIEND REQUEST");
        System.out.println("─────────────────────────────────");
        System.out.print("Enter requester user ID: ");

        try {
            Long requesterId = Long.parseLong(scanner.nextLine().trim());

            User requester = userRepository.findById(requesterId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            System.out.println("Requester: " + requester.getDisplayName() + " (@" + requester.getUsername() + ")");
            System.out.print("Accept this request? (y/n): ");

            if (!scanner.nextLine().trim().equalsIgnoreCase("y")) {
                System.out.println("❌ Cancelled");
                return;
            }

            UserSearchDto.FriendshipStatusDto newStatus =
                    friendService.acceptFriendRequest(currentUserId, requesterId);

            System.out.println("\n✅ Friend request accepted!");
            System.out.println("   New Status: " + getStatusIcon(newStatus) + " " + newStatus);

        } catch (NumberFormatException e) {
            System.out.println("❌ Invalid user ID format");
        }
    }

    private void rejectRequest() {
        System.out.println("\n❌ REJECT FRIEND REQUEST");
        System.out.println("─────────────────────────────────");
        System.out.print("Enter requester user ID: ");

        try {
            Long requesterId = Long.parseLong(scanner.nextLine().trim());

            User requester = userRepository.findById(requesterId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            System.out.println("Requester: " + requester.getDisplayName() + " (@" + requester.getUsername() + ")");
            System.out.print("Reject this request? (y/n): ");

            if (!scanner.nextLine().trim().equalsIgnoreCase("y")) {
                System.out.println("❌ Cancelled");
                return;
            }

            UserSearchDto.FriendshipStatusDto newStatus =
                    friendService.rejectFriendRequest(currentUserId, requesterId);

            System.out.println("\n✅ Friend request rejected!");
            System.out.println("   New Status: " + getStatusIcon(newStatus) + " " + newStatus);

        } catch (NumberFormatException e) {
            System.out.println("❌ Invalid user ID format");
        }
    }
}