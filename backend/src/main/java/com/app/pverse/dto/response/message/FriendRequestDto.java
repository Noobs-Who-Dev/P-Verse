package com.app.pverse.dto.response.message;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestDto {

    @NotNull(message = "Target user ID is required")
    private Long targetUserId;
}