//TYPESETTING ALGORITHM WITH MINIMUM RAGGEDNESS.
//
// Author: Esther Cuervo Fernandez
// 28.Oct.2016


//global variables. Input text (String), Input margin (int), Output text (String), Flag for allowing last line to cut anywhere.
var text, margin, wrapped_text, last_line_flag;

//these variables are made global for visualization of internal algorithm data on html. Should probably be local to the wrap_algorithm function otherwise.
var distances_Matrix, opt, opt_heads, number_words;

//Typesetting algorithm using dynamic programming.
//
//Input: Array of Strings. NOTE: Spaces between words are automatically handled by the algorithm and thus not necessary on Input.
//       Margin. Integer. NOTE: This algorithm functions using chars as the unit of measurement. This can be changed by using another unit on the margin, and indicating the width associated with each word in the text. The basic algorithm would function exactly the same.
//Output: Text wrapped optimally with the given margin.
function wrap_algorithm(words,margin){

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
      if(words_to_typeset==number_words && !last_line_flag && penalization != Infinity){
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

//FUNCTIONS RELATED TO HTML DISPLAY

function submit(){
  reset_debug_info();
  get_input();
  display_unwrapped_text();
  document.getElementById("wrap_button").disabled = false; //Application is ready to wrap text
}

function wrap(){
  wrapped_text = wrap_algorithm(text.split(' '),margin);
  HTML_Display();
  HTML_Display_Debug();
}

function get_input(){
  text=document.getElementById("txt_to_wrap").value;
  margin=document.getElementById("mrgin").value;
  last_line_flag=document.getElementById("flag").checked;
}

function display_unwrapped_text(){
  document.getElementById("text").innerHTML = text;
  var filler_text_margin = "";//String used to display the margin on HTML
  for(var i=0;i<margin;i++){
    filler_text_margin += "a";//Assuming monospace font 'a' can be replaced by any other char. If not monospace, recommended use widest char in font.
  }
  document.getElementById("filler_text").innerHTML = filler_text_margin;
}


function reset_debug_info(){
  document.getElementById("penalization").innerHTML = "";
  document.getElementById("lines").innerHTML = "";
}


function HTML_Display(){
  var wrapped_for_html=wrapped_text.replace(/\n/g,"<br />"); //for html syntax, the new line symbol (\n) is replaced by <br />
  document.getElementById("text").innerHTML = wrapped_for_html;
}


function HTML_Display_Debug(){

  console.log("Matriz: ");
  console.log(distances_Matrix);
  console.log("ppul:  ")
  console.log(ppul);

  //table with one row per line, which includes which words it's comprised of, and their penalization.
  //careful! the table is built backwards, since that's how the ppul array is engineered.
  var current_ppul = ppul[number_words];
  var table = "<tr><th>Words "+ current_ppul + " to " + number_words +"</th><td>"+Math.pow(distances_Matrix[current_ppul][number_words],2)+"</td></tr>";
  var prev_ppul,table_row;
  while(current_ppul != 1){
    prev_ppul = ppul[current_ppul-1];
    table_row = "<tr><th>Words "+ prev_ppul +" to "+ (current_ppul-1) + "</th><td>"+Math.pow(distances_Matrix[prev_ppul][current_ppul-1],2)+"</td></tr>";
    table = table_row+table;
    current_ppul = prev_ppul;
  }
  document.getElementById("lines").innerHTML = table;
  if(!last_line_flag){
    var rows_in_table = document.getElementById("lines").getElementsByTagName("tr");
    rows_in_table[rows_in_table.length-1].style.backgroundColor = "red";
  }

  document.getElementById("penalization").innerHTML = "Final penalization: " + opt[number_words];
}
