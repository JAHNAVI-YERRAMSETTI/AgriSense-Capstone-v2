package com.agrisense.backend.service;

import org.springframework.stereotype.Service;

import com.agrisense.backend.dto.FarmerRegisterRequest;
import com.agrisense.backend.dto.LoginRequest;
import com.agrisense.backend.dto.LoginResponse;
import com.agrisense.backend.model.Farmer;
import com.agrisense.backend.repository.FarmerRepository;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    private final FarmerRepository farmerRepository;

    public AuthenticationServiceImpl(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    @Override
    public LoginResponse registerFarmer(FarmerRegisterRequest request) {

        if (farmerRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(
                    false,
                    "Email already registered",
                    null,
                    null,
                    null,
                    null
            );
        }

        Farmer farmer = new Farmer();

        farmer.setName(request.getName());
        farmer.setEmail(request.getEmail());
        farmer.setPassword(request.getPassword());
        farmer.setPhone(request.getPhone());
        farmer.setLocation(request.getLocation());

        Farmer savedFarmer = farmerRepository.save(farmer);

        return new LoginResponse(
                true,
                "Farmer registered successfully",
                savedFarmer.getId(),
                savedFarmer.getName(),
                savedFarmer.getEmail(),
                "FARMER"
        );
    }

    @Override
    public LoginResponse loginFarmer(LoginRequest request) {

        Farmer farmer = farmerRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        if (farmer == null) {
            return new LoginResponse(
                    false,
                    "Invalid email or password",
                    null,
                    null,
                    null,
                    null
            );
        }

        if (!farmer.getPassword().equals(request.getPassword())) {
            return new LoginResponse(
                    false,
                    "Invalid email or password",
                    null,
                    null,
                    null,
                    null
            );
        }

        return new LoginResponse(
                true,
                "Login successful",
                farmer.getId(),
                farmer.getName(),
                farmer.getEmail(),
                "FARMER"
        );
    }
}