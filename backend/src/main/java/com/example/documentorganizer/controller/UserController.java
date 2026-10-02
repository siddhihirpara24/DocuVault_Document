package com.example.documentorganizer.controller;

import com.example.documentorganizer.dto.*;
import com.example.documentorganizer.security.UserPrincipal;
import com.example.documentorganizer.service.DocumentService;
import com.example.documentorganizer.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final DocumentService documentService;

    public UserController(UserService userService, DocumentService documentService) {
        this.userService = userService;
        this.documentService = documentService;
    }

    @GetMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserProfileResponse profile = userService.getProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully.", profile));
    }

    @PutMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse updated = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.", updated));
    }

    @PutMapping("/users/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully."));
    }

    @GetMapping("/user/dashboard")
    public ResponseEntity<ApiResponse<UserDashboardResponse>> getUserDashboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserDashboardResponse dashboard = documentService.getUserDashboard(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User dashboard data fetched successfully.", dashboard));
    }
}
