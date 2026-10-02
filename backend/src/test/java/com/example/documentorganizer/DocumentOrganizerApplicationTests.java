package com.example.documentorganizer;

import com.example.documentorganizer.dto.LoginRequest;
import com.example.documentorganizer.dto.RegisterRequest;
import com.example.documentorganizer.entity.Role;
import com.example.documentorganizer.entity.User;
import com.example.documentorganizer.entity.UserStatus;
import com.example.documentorganizer.repository.CategoryRepository;
import com.example.documentorganizer.repository.DocumentRepository;
import com.example.documentorganizer.repository.UserRepository;
import com.example.documentorganizer.security.JwtService;
import com.example.documentorganizer.service.AuthService;
import com.example.documentorganizer.service.DocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DocumentOrganizerApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthService authService;

    @Autowired
    private DocumentService documentService;

    @Test
    void contextLoads() {
        assertNotNull(userRepository);
        assertNotNull(documentRepository);
        assertNotNull(categoryRepository);
    }

    @Test
    @DisplayName("Test 1: User Registration, Duplicate Prevention, and Login JWT Flow")
    void testAuthFlow() throws Exception {
        String testEmail = "testuser" + System.currentTimeMillis() + "@example.com";

        // 1. Register User
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Alice Test");
        registerReq.setEmail(testEmail);
        registerReq.setPassword("Password@123");
        registerReq.setConfirmPassword("Password@123");
        registerReq.setPhone("+1-555-1234");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        // 2. Duplicate Email Registration Should Fail (400 Bad Request)
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 3. Login with Correct Credentials
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.email", is(testEmail)))
                .andExpect(jsonPath("$.data.role", is("ROLE_USER")));

        // 4. Login with Wrong Password Should Fail (401 Unauthorized)
        loginReq.setPassword("WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 2: Document Ownership Verification (User cannot access another user's document)")
    void testDocumentOwnershipProtection() throws Exception {
        // Create User A
        User userA = new User("User A", "userA_" + System.currentTimeMillis() + "@example.com",
                "+1-111", passwordEncoder.encode("Pass@123"), Role.ROLE_USER, UserStatus.ACTIVE);
        userA = userRepository.save(userA);

        // Create User B
        User userB = new User("User B", "userB_" + System.currentTimeMillis() + "@example.com",
                "+1-222", passwordEncoder.encode("Pass@123"), Role.ROLE_USER, UserStatus.ACTIVE);
        userB = userRepository.save(userB);

        // Upload Document for User A
        MockMultipartFile file = new MockMultipartFile(
                "file", "contract.pdf", "application/pdf", "%PDF-1.4 test contract content".getBytes()
        );

        var docA = documentService.uploadDocument(userA.getId(), "Confidential NDA", null, "Secret contract", file);
        assertNotNull(docA.getId());

        // Generate token for User B
        var userPrincipalB = new com.example.documentorganizer.security.UserPrincipal(userB);
        String tokenB = jwtService.generateToken(userPrincipalB);

        // User B tries to view User A's document -> Must return 401 Unauthorized / Forbidden
        mockMvc.perform(get("/api/documents/" + docA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isUnauthorized());

        // User B tries to download User A's document -> Must return 401 Unauthorized / Forbidden
        mockMvc.perform(get("/api/documents/" + docA.getId() + "/download")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isUnauthorized());

        // User B tries to delete User A's document -> Must return 401 Unauthorized / Forbidden
        mockMvc.perform(delete("/api/documents/" + docA.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isUnauthorized());

        // User A accesses their own document -> Succeeds (200 OK)
        var userPrincipalA = new com.example.documentorganizer.security.UserPrincipal(userA);
        String tokenA = jwtService.generateToken(userPrincipalA);

        mockMvc.perform(get("/api/documents/" + docA.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.documentName", is("Confidential NDA")));
    }

    @Test
    @DisplayName("Test 3: Role-Based Access Control (Regular user blocked from Admin endpoints)")
    void testAdminAccessControl() throws Exception {
        // Create regular user
        User regularUser = new User("Regular User", "reg_" + System.currentTimeMillis() + "@example.com",
                null, passwordEncoder.encode("User@123"), Role.ROLE_USER, UserStatus.ACTIVE);
        regularUser = userRepository.save(regularUser);

        var regularPrincipal = new com.example.documentorganizer.security.UserPrincipal(regularUser);
        String userToken = jwtService.generateToken(regularPrincipal);

        // Regular user attempts to access /api/admin/users -> Must return 403 Forbidden
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Regular user attempts to access /api/admin/dashboard -> Must return 403 Forbidden
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Create Admin user
        User adminUser = new User("Admin", "admin_" + System.currentTimeMillis() + "@example.com",
                null, passwordEncoder.encode("Admin@123"), Role.ROLE_ADMIN, UserStatus.ACTIVE);
        adminUser = userRepository.save(adminUser);

        var adminPrincipal = new com.example.documentorganizer.security.UserPrincipal(adminUser);
        String adminToken = jwtService.generateToken(adminPrincipal);

        // Admin user accesses /api/admin/users -> Succeeds (200 OK)
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("Test 4: File Upload Security Validation (Invalid extension rejected)")
    void testFileUploadExtensionValidation() {
        User user = new User("Uploader", "up_" + System.currentTimeMillis() + "@example.com",
                null, passwordEncoder.encode("Pass@123"), Role.ROLE_USER, UserStatus.ACTIVE);
        final User savedUser = userRepository.save(user);

        // Try uploading an unpermitted extension (.exe)
        MockMultipartFile badFile = new MockMultipartFile(
                "file", "malware.exe", "application/x-msdownload", "fake executable binary".getBytes()
        );

        assertThrows(Exception.class, () -> {
            documentService.uploadDocument(savedUser.getId(), "Dangerous File", null, "testing rejection", badFile);
        });
    }
}
