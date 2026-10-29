package com.agrisense.backend.service;

import com.agrisense.backend.dto.FarmerRegisterRequest;
import com.agrisense.backend.dto.LoginRequest;
import com.agrisense.backend.dto.LoginResponse;

public interface AuthenticationService {

    LoginResponse registerFarmer(FarmerRegisterRequest request);

    LoginResponse loginFarmer(LoginRequest request);
}