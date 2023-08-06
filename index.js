const fs = require('fs');

//  FSS Configuration Constraints 


const constraintsMap = new Map();

fs.readFile('data.json', 'utf-8',(err,data)=>{
    if(err){
        console.error('Error at ',err);
        return;
    }

    const usedData = JSON.parse(data);
   
    // Add the Data into the Maps//
    usedData.forEach((item,index)=>{
        const key = `obj${index+1}` ;
        constraintsMap.set(key,item);
    });
    
    return constraintsMap ; 
    
 
})


// Genetic Algorithm Parameters
const populationSize = 100000;
const generations = 1000;
const mutationRate = 0.087;
const crossoverRate = 0.654;

// Sample FSS configurations
const fssConfigurations = Array.from(constraintsMap.values());

// Sample Frequencies to block
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
 

  


  // Cross Over 
  function crossover(parent1, parent2) {
  const crossoverPoint1 = Math.floor(Math.random() * parent1.length);
  const crossoverPoint2 = Math.floor(Math.random() * parent1.length);

  // Ensure crossoverPoint1 is smaller than crossoverPoint2
  const start = Math.min(crossoverPoint1, crossoverPoint2);
  const end = Math.max(crossoverPoint1, crossoverPoint2);

  // Create a new child by combining genetic material from both parents
  const child = [...parent1.slice(0, start), ...parent2.slice(start, end), ...parent1.slice(end)];

  return child;
}



  


// Mutation //

function mutate(child, mutationRate) {
  for (let i = 0; i < child.length; i++) {
    // Introduce swap mutation with a probability of mutationRate
    if (Math.random() < mutationRate) {
      const randomIndex = Math.floor(Math.random() * child.length);
      // Swap the values of two random genes in the child's FSS configuration
      const temp = child[i];
      child[i] = child[randomIndex];
      child[randomIndex] = temp;
    }
  }
}

  

const bestFSSConfig = geneticAlgorithm();
console.log("Best FSS Configuration :" + bestFSSConfig );