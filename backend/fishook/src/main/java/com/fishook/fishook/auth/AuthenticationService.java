package com.fishook.fishook.auth;

import com.fishook.fishook.config.JwtService;
import com.fishook.fishook.dto.UserDto;
import com.fishook.fishook.entity.Role;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.exception.UserAlreadyExistsException;
import com.fishook.fishook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;
import java.util.TimeZone;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        formatter.setTimeZone(TimeZone.getTimeZone("UTC")); // Set formatter to UTC

        Optional<UserEntity> user = userRepository.findByEmail(request.getEmail());

        if (user.isPresent()) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }

        Date parsedDate;
        try {
            parsedDate = formatter.parse(request.getDate());
        } catch (ParseException e) {
            throw new RuntimeException("Invalid date format: " + request.getDate(), e);
        }

        UserEntity userEntity = UserEntity
                .builder()
                .name(request.getName())
                .lastname(request.getSurname())
                .dateOfBirth(parsedDate)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .registrationDate(new Date())
                .profilePicture("https://i.pinimg.com/564x/0e/ab/8d/0eab8de65a76d25a9b99d60f699d94d3.jpg")
                .role(Role.USER)
                .build();

        userRepository.save(userEntity);

        UserDto userDto = new UserDto(
                userEntity.getId(),
                userEntity.getName(),
                userEntity.getLastname(),
                userEntity.getEmail(),
                userEntity.getProfilePicture(),
                userEntity.getDateOfBirth(),
                userEntity.getRole().toString()
        );

        String jwtToken = jwtService.generatetoken(userEntity);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .user(userDto)
                .build();
    }

    public AuthenticationResponse login(LoginRequest request) {
        try {
            Optional<UserEntity> userOptional = userRepository.findByEmail(request.getEmail());
            if (!userOptional.isPresent()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No account found with this email address"
                );
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            UserEntity userEntity = userOptional.get();

            UserDto userDto = new UserDto(
                    userEntity.getId(),
                    userEntity.getName(),
                    userEntity.getLastname(),
                    userEntity.getEmail(),
                    userEntity.getProfilePicture(),
                    userEntity.getDateOfBirth(),
                    userEntity.getRole().toString()
            );

            String jwtToken = jwtService.generatetoken(userEntity);
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .user(userDto)
                    .build();

        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid password. Please check your password and try again."
            );
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication failed. Please check your credentials."
            );
        }
    }
}