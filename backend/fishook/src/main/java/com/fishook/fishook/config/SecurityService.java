package com.fishook.fishook.config;

import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class SecurityService {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public SecurityService(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Gets the current user ID by extracting the email from the principal
     * in the security context and then finding the user by email
     *
     * @return The current user ID or null if not authenticated
     */
    public Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();

                if (principal instanceof UserDetails) {
                    UserDetails userDetails = (UserDetails) principal;
                    String email = userDetails.getUsername();

                    UserEntity user = userRepository.findByEmail(email)
                            .orElse(null);

                    return user != null ? user.getId() : null;
                }
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isResourceOwner(Long resourceUserId) {
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(resourceUserId);
    }
}