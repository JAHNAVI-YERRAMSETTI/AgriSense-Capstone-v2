package com.agrisense.backend.service;

import java.util.List;

import com.agrisense.backend.model.Farm;

public interface FarmService {

    Farm addFarm(Farm farm);

    List<Farm> getAllFarms();

    Farm getFarmById(Long id);

    List<Farm> getFarmsByFarmerId(Long farmerId);

    Farm updateFarm(Long id, Farm farm);

    boolean deleteFarm(Long id);
}