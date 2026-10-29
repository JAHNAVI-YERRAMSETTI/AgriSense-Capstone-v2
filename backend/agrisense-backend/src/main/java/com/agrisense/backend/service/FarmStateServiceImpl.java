package com.agrisense.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agrisense.backend.model.Farm;
import com.agrisense.backend.model.FarmState;
import com.agrisense.backend.repository.FarmRepository;
import com.agrisense.backend.repository.FarmStateRepository;

@Service
public class FarmStateServiceImpl implements FarmStateService {

    private final FarmStateRepository farmStateRepository;

    private final FarmRepository farmRepository;

    public FarmStateServiceImpl(
            FarmStateRepository farmStateRepository,
            FarmRepository farmRepository) {

        this.farmStateRepository = farmStateRepository;
        this.farmRepository = farmRepository;
    }

    @Override
    public FarmState addFarmState(FarmState farmState) {

        Farm farm = farmRepository
                .findById(farmState.getFarm().getId())
                .orElse(null);

        if (farm == null) {
            return null;
        }

        FarmState existingState =
                farmStateRepository.findByFarm(farm).orElse(null);

        if (existingState != null) {

            existingState.setCrop(farmState.getCrop());
            existingState.setGrowthStage(farmState.getGrowthStage());

            existingState.setSoilMoisture(farmState.getSoilMoisture());
            existingState.setSoilPh(farmState.getSoilPh());

            // New soil nutrient fields
            existingState.setNitrogen(farmState.getNitrogen());
            existingState.setPhosphorus(farmState.getPhosphorus());
            existingState.setPotassium(farmState.getPotassium());

            existingState.setTemperature(farmState.getTemperature());
            existingState.setHumidity(farmState.getHumidity());
            existingState.setRainfall(farmState.getRainfall());

            existingState.setWaterAvailable(farmState.getWaterAvailable());
            existingState.setLabourAvailable(farmState.getLabourAvailable());
            existingState.setBudgetAvailable(farmState.getBudgetAvailable());

            existingState.setCropHealth(farmState.getCropHealth());
            existingState.setDiseaseStatus(farmState.getDiseaseStatus());

            return farmStateRepository.save(existingState);
        }

        farmState.setFarm(farm);

        return farmStateRepository.save(farmState);
    }

    @Override
    public List<FarmState> getAllFarmStates() {

        return farmStateRepository.findAll();
    }

    @Override
    public FarmState getFarmStateById(Long id) {

        return farmStateRepository.findById(id).orElse(null);
    }

    @Override
    public FarmState getFarmStateByFarmId(Long farmId) {

        Farm farm = farmRepository
                .findById(farmId)
                .orElse(null);

        if (farm == null) {
            return null;
        }

        return farmStateRepository
                .findByFarm(farm)
                .orElse(null);
    }

    @Override
    public FarmState updateFarmState(
            Long id,
            FarmState farmState) {

        FarmState existingState =
                farmStateRepository
                        .findById(id)
                        .orElse(null);

        if (existingState == null) {
            return null;
        }

        existingState.setCrop(farmState.getCrop());
        existingState.setGrowthStage(farmState.getGrowthStage());

        existingState.setSoilMoisture(farmState.getSoilMoisture());
        existingState.setSoilPh(farmState.getSoilPh());

        // New soil nutrient fields
        existingState.setNitrogen(farmState.getNitrogen());
        existingState.setPhosphorus(farmState.getPhosphorus());
        existingState.setPotassium(farmState.getPotassium());

        existingState.setTemperature(farmState.getTemperature());
        existingState.setHumidity(farmState.getHumidity());
        existingState.setRainfall(farmState.getRainfall());

        existingState.setWaterAvailable(farmState.getWaterAvailable());
        existingState.setLabourAvailable(farmState.getLabourAvailable());
        existingState.setBudgetAvailable(farmState.getBudgetAvailable());

        existingState.setCropHealth(farmState.getCropHealth());
        existingState.setDiseaseStatus(farmState.getDiseaseStatus());

        return farmStateRepository.save(existingState);
    }

    @Override
    public boolean deleteFarmState(Long id) {

        if (!farmStateRepository.existsById(id)) {
            return false;
        }

        farmStateRepository.deleteById(id);

        return true;
    }
}