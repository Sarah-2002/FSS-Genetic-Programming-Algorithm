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




// Method 3 : Uniform Crossover  //


// Function to perform Uniform Crossover between two parents
function crossoverUniform(parent1, parent2) {
  // Create a new child by randomly selecting genetic material from both parents
  const child = parent1.map((gene, index) => (Math.random() < 0.5 ? gene : parent2[index]));

  return child;
}

  */
  
  function mutate(child, mutationRate) {
    // Method 1 : Random Mutation //
    for (let i = 0; i < child.length; i++) {
      // Introduce random changes with a probability of mutationRate
      if (Math.random() < mutationRate) {
        // Randomly change the value of the gene (FSS configuration parameter)
        // Here, you can define the range of values for each gene based on your constraints
        child[i] = Math.random() * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
      }
    }
   
  }

  /* 


  Method 2 : Gaussian Mutation 
// Function to perform Gaussian Mutation in the child's FSS configuration
function mutateGaussian(child, mutationRate) {
  const mutationAmount = mutationRate * (MAX_VALUE - MIN_VALUE);

  for (let i = 0; i < child.length; i++) {
    // Introduce Gaussian-distributed random changes with a mean of 0 and standard deviation of mutationAmount
    if (Math.random() < mutationRate) {
      child[i] += (Math.random() - 0.5) * 2 * mutationAmount;
      // Make sure the value stays within the allowed range defined by your constraints
      child[i] = Math.max(Math.min(child[i], MAX_VALUE), MIN_VALUE);
    }
  }
}


// Method 3 : Swap Method //

function mutateSwap(child, mutationRate) {
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

  */

const bestFSSConfig = geneticAlgorithm();
console.log("Best FSS Configuration :" + bestFSSConfig );