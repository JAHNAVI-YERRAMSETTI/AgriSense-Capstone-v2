package com.agrisense.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agrisense.backend.model.Farm;
import com.agrisense.backend.model.Farmer;
import com.agrisense.backend.repository.FarmRepository;
import com.agrisense.backend.repository.FarmerRepository;

@Service
public class FarmServiceImpl implements FarmService {

    private final FarmRepository farmRepository;
    private final FarmerRepository farmerRepository;

    public FarmServiceImpl(FarmRepository farmRepository,
                           FarmerRepository farmerRepository) {
        this.farmRepository = farmRepository;
        this.farmerRepository = farmerRepository;
    }

    @Override
    public Farm addFarm(Farm farm) {
        return farmRepository.save(farm);
    }

    @Override
    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    @Override
    public Farm getFarmById(Long id) {
        return farmRepository.findById(id).orElse(null);
    }

    @Override
    public List<Farm> getFarmsByFarmerId(Long farmerId) {

        Farmer farmer = farmerRepository.findById(farmerId).orElse(null);

        if (farmer == null) {
            return List.of();
        }

        return farmRepository.findByFarmer(farmer);
    }

    @Override
    public Farm updateFarm(Long id, Farm farm) {

        Farm existingFarm = farmRepository.findById(id).orElse(null);

        if (existingFarm == null) {
            return null;
        }

        existingFarm.setFarmName(farm.getFarmName());
        existingFarm.setLocation(farm.getLocation());
        existingFarm.setArea(farm.getArea());
        existingFarm.setCrop(farm.getCrop());
        existingFarm.setVariety(farm.getVariety());
        existingFarm.setGrowthStage(farm.getGrowthStage());

        return farmRepository.save(existingFarm);
    }

    @Override
    public boolean deleteFarm(Long id) {

        if (!farmRepository.existsById(id)) {
            return false;
        }

        farmRepository.deleteById(id);
        return true;
    }
}