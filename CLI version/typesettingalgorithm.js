//TYPESETTING ALGORITHM USING DYNAMIC PROGRAMMING CMD LINE VERSION
// Author: Esther Cuervo Fernandez

//global variables. Input text (String), Input margin (int), Output text (String)
var text, margin, wrapped_text;

if(process.argv.length != 4){
  console.log("Usage: node typesettingalgorithm.js Text(Array of Words) Margin(Integer number of characters)");
}

else{
//gets input values from command
text = process.argv[2];
margin= process.argv[3];

//triggers the typesetting algorithm
wrapped_text = wrap_algorithm(text.split(' '),margin);
console.log();
console.log(wrapped_text);
console.log();
}

//Typesetting algorithm using dynamic programming.
//
//Input: Array of Strings. NOTE: Spaces between words are automatically handled by the algorithm and thus not necessary on Input.
//       Margin. Integer. NOTE: This algorithm functions using chars as the unit of measurement. This can be changed by using another unit on the margin, and indicating the width associated with each word in the text. The basic algorithm would function exactly the same.
//Output: Text wrapped optimally with the given margin.
function wrap_algorithm(words,margin){
  var distances_Matrix, opt, opt_heads, number_words;
  number_words=words.length;
  words.unshift(['EmptyWord']) ; //Makes indexing words by 1 possible

  distances_Matrix = new Array(number_words+1); //Matrix indexed by 1
  for(var i = 1; i<number_words+1; i++){
    distances_Matrix[i] = new Array(number_words);
  }

  for(var row = 1; row < number_words+1; row++){
    distances_Matrix[row][row] = margin - words[row].length; //Fills main diagonal
    for(var column = row+1; column < number_words+1; column++){
      //Decreasing by one unit new_cost is done to take into account one space between each word on the line. This is not done on the main diagonal to avoid counting one extra space after what would be the '/n' character.
      var new_cost = distances_Matrix[row][column-1] - words[column].length - 1;
      if(new_cost < 0){ //Line wouldn't fit on the margin
        distances_Matrix[row][column] = Infinity;
      }
      else{
        distances_Matrix[row][column] = new_cost;
      }
    }
  }

  opt = new Array(number_words+1); //opt[i]: penalization that results from typesetting i words optimally.
  ppul = new Array(number_words+1); //ppul(i): index of the first word of the last line when typesetting i words optimally.
                                   //n+1 positions to keep consistency with opt

  opt[0] = 0; //set by agreement
  ppul[0] = 1; //keeping consistency

  for (words_to_typeset=1; words_to_typeset<number_words+1; words_to_typeset++){
    var minimum=Infinity;
    var penalization;
    for (possible_ppul=1; possible_ppul<words_to_typeset+1; possible_ppul++){
      penalization = Math.pow(distances_Matrix[possible_ppul][words_to_typeset],2);
      //if the last_line_flag isn't set, we don't take into account the penalization when considering typesetting n words.
      //though we still need to check it's not infinity, meaning the words actually fit on the line.
      if(words_to_typeset==number_words && penalization != Infinity){
             penalization = 0;
      }
      minimum = Math.min(minimum,opt[possible_ppul-1]+penalization);
      if(minimum == opt[possible_ppul-1]+penalization){//if the current was the minimum we store the possible ppul
          ppul[words_to_typeset]=possible_ppul;
      }
    }
    opt[words_to_typeset] = minimum;
  }


  var current_ppul = ppul[number_words];

  while(current_ppul != 1){
    words[current_ppul-1]+="\n";
    current_ppul = ppul[current_ppul-1]; //next ppul will be that which optimizes ppul-1 words
  }

  words.shift(); //We eliminate the first empty word, which was just used to index words by 1

  var final_text = words.join(' ');
  final_text = final_text.replace(/\n\s/g,"\n"); //join causes a space after the \n symbols, which we eliminate with a reg. exp

  return final_text;
}
