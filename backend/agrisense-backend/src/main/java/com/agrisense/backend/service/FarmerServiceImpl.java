package com.agrisense.backend.service;

import org.springframework.stereotype.Service;

import com.agrisense.backend.dto.FarmerResponse;
import com.agrisense.backend.dto.FarmerUpdateRequest;
import com.agrisense.backend.model.Farmer;
import com.agrisense.backend.repository.FarmerRepository;

@Service
public class FarmerServiceImpl implements FarmerService {

    private final FarmerRepository farmerRepository;

    public FarmerServiceImpl(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    @Override
    public FarmerResponse getFarmerById(Long id) {

        Farmer farmer = farmerRepository
                .findById(id)
                .orElse(null);

        if (farmer == null) {
            return null;
        }

        return convertToResponse(farmer);
    }

    @Override
    public FarmerResponse updateFarmer(
            Long id,
            FarmerUpdateRequest request
    ) {

        Farmer farmer = farmerRepository
                .findById(id)
                .orElse(null);

        if (farmer == null) {
            return null;
        }

        farmer.setName(request.getName());
        farmer.setPhone(request.getPhone());
        farmer.setLocation(request.getLocation());

        Farmer updatedFarmer =
                farmerRepository.save(farmer);

        return convertToResponse(updatedFarmer);
    }

    private FarmerResponse convertToResponse(Farmer farmer) {

        return new FarmerResponse(
                farmer.getId(),
                farmer.getName(),
                farmer.getEmail(),
                farmer.getPhone(),
                farmer.getLocation()
        );
    }
}