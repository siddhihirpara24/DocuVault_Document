package com.example.documentorganizer.repository;

import com.example.documentorganizer.entity.Role;
import com.example.documentorganizer.entity.User;
import com.example.documentorganizer.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(UserStatus status);

    long countByRole(Role role);

    List<User> findTop5ByOrderByCreatedAtDesc();
}
