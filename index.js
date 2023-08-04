const fs = require('fs');

//  FSS Configuration Constraints 

fs.readFile('data.json', 'utf-8',(err,data)=>{
    if(err){
        console.error('Error at ',err);
        return;
    }

    const usedData = JSON.parse(data);
    const constraintsMap = new Map();
    // Add the Data into the Maps//
    usedData.forEach((item,index)=>{
        const key = `obj${index+1}` ;
        constraintsMap.set(key,item);
    });
})


// Genetic Algorithm Parameters
const populationSize = 100000;
const generations = 1000;
const mutationRate = 0.087;
const crossoverRate = 0.654;

// Sample FSS configurations
const fssConfigurations = Array.from(constraintsMap.values());

// Frequencies to block
const frequenciesToBlock = [
  { frequency: "2.45 GHz", description: "Microwave Ovens" },
  { frequency: "24 GHz", description: "Some Industrial, Scientific, and Medical (ISM) Applications" },
  // I can add more .... //
];

// Function to check if the FSS material blocks a specific frequency
function blocksFrequency(material, frequency) {
  // For simplicity we'll consider Copper and Aluminum only // 
  const blockingMaterials = {
    "Copper": ["2.45 GHz"],
    "Aluminum": ["24 GHz"],
    // I can add more FSS materials and their blocking frequencies here
  };

  return blockingMaterials[material]?.includes(frequency);
}

//  Now we Calculate the percentage of frequencies blocked for each FSS material

// array of all the material types we have in our JSON data //
const fssMaterials = ["Copper", "Aluminum", "Silver", "Gold", "Stainless Steel", "Dielectric Material", "Carbon Nanotubes", "Graphene", "Teflon", "Conductive Polymer"];
let frequenciesBlockedByMaterial = {};

for (const material of fssMaterials) {
  let numFrequenciesBlocked = 0;

  for (const frequency of frequenciesToBlock) {
    if (blocksFrequency(material, frequency.frequency)) {
      numFrequenciesBlocked++;
    }
  }

  const percentageBlocked = (numFrequenciesBlocked / frequenciesToBlock.length) * 100;
  frequenciesBlockedByMaterial[material] = percentageBlocked;
}

// Fitness Function: Evaluate the fitness of an FSS configuration
function fitnessFunction(configuration) {
    let numFrequenciesBlocked = 0;
  
    for (const frequency of frequenciesToBlock) {
      if (blocksFrequency(configuration.material, frequency.frequency)) {
        numFrequenciesBlocked++;
      }
    }
  
    const totalFrequencies = frequenciesToBlock.length;
    const percentageBlocked = (numFrequenciesBlocked / totalFrequencies) * 100;
    
    // Higher fitness scores indicate better FSS designs.
    return percentageBlocked;
  }
  
  // Calculate the fitness scores for each FSS configuration
  const fitnessScores = fssConfigurations.map((config) => ({
    fssConfig: config,
    fitnessScore: fitnessFunction(config),
  }));
  
  console.log("Fitness Scores for each FSS Configuration:");
  console.log(fitnessScores);

// ************************************************************************************************************************************************************************************** //




// Genetic Algorithm
function geneticAlgorithm() {
    // Initialize the population with FSS configurations from data.json
    let population = fssConfigurations;
  
    // Keep track of the best FSS configuration
    let bestConfiguration = null;
    let bestFitness = 0;
  
    // Evolution loop
    for (let generation = 0; generation < generations; generation++) {
      // Evaluate the fitness of each FSS configuration in the population
      population.forEach(config => {
        config.fitness = fitnessFunction(config);
      });
  
      // Sort the population based on fitness (descending order)
      population.sort((a, b) => b.fitness - a.fitness);
  
      // Check if the best configuration in this generation is better than the overall best
      if (population[0].fitness > bestFitness) {
        bestConfiguration = population[0];
        bestFitness = population[0].fitness;
      }
  
      // Perform selection, crossover, and mutation to create the next generation
      let newPopulation = [];
      while (newPopulation.length < populationSize) {
        // Perform selection: Choose two parents based on their fitness
        let parent1 = selectParent(population);
        let parent2 = selectParent(population);
  
        // Perform crossover: Create a new child by combining the parents
        let child = crossover(parent1, parent2);
  
        // Perform mutation: Introduce random changes in the child
        mutate(child, mutationRate);
  
        newPopulation.push(child);
      }
  
      // Replace the old population with the new one
      population = newPopulation;
    }
  
    // Return the best FSS configuration after the evolution process
    return bestConfiguration;
  }



function selectParent(population) {
   // Function to perform Stochastic Universal Sampling (SUS) for parent selection Method 1
    const totalFitness = population.reduce((sum, config) => sum + config.fitness, 0);
    const averageFitness = totalFitness / population.length;
  
    // Calculate the sum of squared fitness deviations
    const squaredDeviationsSum = population.reduce(
      (sum, config) => sum + Math.pow(config.fitness - averageFitness, 2),
      0
    );
  
    // Calculate the standard deviation of fitness
    const standardDeviation = Math.sqrt(squaredDeviationsSum / population.length);
  
    // Create evenly spaced pointers on the roulette wheel
    const pointers = [];
    const pointerDistance = totalFitness / populationSize;
    let start = Math.random() * pointerDistance;
    for (let i = 0; i < populationSize; i++) {
      pointers.push(start + i * pointerDistance);
    }
  
    // Select parents using SUS
    const parents = [];
    let currentFitness = population[0].fitness;
    let currentIndex = 0;
    for (let pointer of pointers) {
      while (pointer > currentFitness) {
        currentIndex = (currentIndex + 1) % population.length;
        currentFitness += population[currentIndex].fitness;
      }
      parents.push(population[currentIndex]);
    }
  
    return parents;


  }

  /*  Method 2 :
  function selectParent(population) {
  // Function to perform Tournament Selection for parent selection
  const tournamentSize = 5; // Adjust the tournament size as needed

  // Select parents using Tournament Selection
  const parents = [];
  for (let i = 0; i < populationSize; i++) {
    // Randomly pick tournamentSize individuals from the population
    const tournamentParticipants = [];
    for (let j = 0; j < tournamentSize; j++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournamentParticipants.push(population[randomIndex]);
    }

    // Sort the tournament participants based on their fitness (descending order)
    tournamentParticipants.sort((a, b) => b.fitness - a.fitness);

    // Select the fittest individual from the tournament as a parent
    parents.push(tournamentParticipants[0]);
  }

  return parents;
}

***********************************************************************************************************************************************************************************************


Method 3 :

function selectParent(population) {
  // Function to perform Rank Selection for parent selection
  const rankedPopulation = population.slice().sort((a, b) => b.fitness - a.fitness);

  // Calculate the selection probabilities based on the rank
  const rankSum = (populationSize * (populationSize + 1)) / 2;
  const selectionProbabilities = rankedPopulation.map((config, index) => (index + 1) / rankSum);

  // Select parents using Rank Selection
  const parents = [];
  for (let i = 0; i < populationSize; i++) {
    // Generate a random number between 0 and 1
    const randomProbability = Math.random();

    // Find the individual whose probability interval contains the random number
    let cumulativeProbability = 0;
    for (let j = 0; j < populationSize; j++) {
      cumulativeProbability += selectionProbabilities[j];
      if (randomProbability <= cumulativeProbability) {
        parents.push(rankedPopulation[j]);
        break;
      }
    }
  }

  return parents;
}

  */
  
  function crossover(parent1, parent2) {
    // Perform crossover between two parents to create a new child

    // Method 1  Single-Point Crossover //
    const crossoverPoint = Math.floor(Math.random() * parent1.length);

    // Create a new child by combining genetic material from both parents
    const child = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
  
    return child;
  }


  /*

  // Method 2 : 
  function crossoverTwoPoint(parent1, parent2) {
  const crossoverPoint1 = Math.floor(Math.random() * parent1.length);
  const crossoverPoint2 = Math.floor(Math.random() * parent1.length);

  // Ensure crossoverPoint1 is smaller than crossoverPoint2
  const start = Math.min(crossoverPoint1, crossoverPoint2);
  const end = Math.max(crossoverPoint1, crossoverPoint2);

  // Create a new child by combining genetic material from both parents
  const child = [...parent1.slice(0, start), ...parent2.slice(start, end), ...parent1.slice(end)];

  return child;
}




// Method 3 //


















  */
  
  function mutate(child, mutationRate) {
    // Introduce random changes in the child's FSS configuration with a given mutation rate
   
  }


