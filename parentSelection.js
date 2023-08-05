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
 
   //  Method 2 :
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
 
 
 
 
 // Method 3 :
 
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
 
   