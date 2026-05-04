package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u.profilePicture FROM User u WHERE LOWER(u.name) = LOWER(:name) AND u.role = 'PROVIDER' ORDER BY u.id DESC LIMIT 1")
    Optional<String> findProfilePictureByName(String name);

    @Query("SELECT u.profilePicture FROM User u WHERE u.email = :email")
    Optional<String> findProfilePictureByEmail(String email);
}
