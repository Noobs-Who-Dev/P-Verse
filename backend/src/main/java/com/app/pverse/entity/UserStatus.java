package com.app.pverse.entity;

/**
 * User Status Enum
 * Định nghĩa các trạng thái của user
 */
public enum UserStatus {
    ONLINE,     // Đang hoạt động
    AWAY,       // Vắng mặt (không tương tác > 5 phút)
    OFFLINE     // Không trực tuyến
}

