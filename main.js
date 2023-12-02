$(document).ready(function(){
	//глобальна змінна
	maximum_x = 2;
	// Рахуємо максимальну кількість Іксів
	$('#limitation_block .limitation').each(function(){
		var inputCount = $(this).find('input').length -1;
		if (inputCount > maximum_x)
			maximum_x = inputCount;
	})
	// Показуємо обмеження(Зроблено для плавної появи нових обмежень)
	$('.limitation').show();
})

// Додаєм Х
$(document).on('click', 'a.add_x', function(){
	// Обмежили кількість Іксів до 15
	if ($(this).parents('.expression').find('input').length < 15) {
		let XCount;
		if ($(this).parents('.equation').length) {
			XCount = $(this).parents('.expression').find('input').length + 1;
			if (XCount > maximum_x) {
				maximum_x = XCount;
			}
		} else {
			XCount = $(this).parents('.expression').find('input').length;
			if (XCount > maximum_x) {
				maximum_x = XCount;
			}
		}
		$('.expression').children('.left_side').append(` + <input type="text" value="0" /><i>x</i><sub>${XCount}</sub>`);
	}
	return false;
});

// Додаєм обмеження
$(document).on('click', '.limitation_add a', function(){
	let limitation = '<input type="text" value ="0" /><i>x</i><sub>1</sub> ';
	for (let q = 2; q <= maximum_x; q++)
		limitation += '+<input type="text" value ="0" /><i>x</i> <sub>' + q +  ' </sub>';
	let html_code = ' <div class="limitation expression"> <span class="left_side">'+limitation+'</span> <span class="right_side"> <select><option value="1">≤</option><option value="-1">≥</option></select><input type="text" value ="0" /></span></div>';
	$('#limitation_block').append(html_code);
	$('#limitation_block .limitation:hidden').slideDown(200);
	return false;
});

// Рахуємо
$('.submit a').live('click', function(){
	$('#result').html(' '); // Очищаємо поле результатів
		var matrix = new Array();
		var i = 0;
	// Перебираємо всі обмеження
		$('#limitation_block .limitation').each(function(){
			matrix[i] = new Array();
			for (var j = 0; j < maximum_x + 1; j++) {
				if ($(this).find('input').eq(j).length && $(this).find('input').eq(j).val() ){
					var inp_val = $(this).find('input').eq(j).val() * $(this).find('select').val();
				}else{
					var inp_val = 0;
				}
				matrix[i][j] = inp_val; // Матриця вихідних значень
			}
			i++;
		})
	// Масив індексів по горизонталі
	horisont_x = new Array();
	for (i=0; i< maximum_x + 1; i++){
		horisont_x[i] = i;
	}

	// Масив індексів з вертикалі
	vertical_x = new Array();
	for (i=0; i< $('#limitation_block .limitation').length; i++){
		vertical_x[i] = i + maximum_x;
	}

	// Матриця вільних членів
	var free = new Array();
	for (var k=0; k < matrix.length; k++){
		free[k] = matrix[k][maximum_x];
	}
	free[matrix.length] = 0;

	// Останній рядок дельта
	Fun = new Array();
	for (var j = 0; j < matrix[0].length; j++) {
		if ($('.equation .left_side').find('input').eq(j).length){
			var inp_val = $('.equation .left_side').find('input').eq(j).val() * $('.equation select').val();
		}else{
			var inp_val = 0;
		}
		Fun[j] = inp_val;// Матриця вихідних значень
	}
	// Додамо її до основної матриці
	matrix.push(Fun);

	// Чи є негативні елементи в матриці вільних членів
	if (minelm(free) < 0){
		iteration = 0;
		SimplexStep1();
	}

	// Чи є негативні елементи в останньомурядоку
	if (minelm(matrix[matrix.length-1], false, true) < 0){
		iteration = 0;
		SimplexStep2();
	}
	print_table(matrix); // Відображаємо підсумкову таблицю
	results(); // Відображаємо результати


	function SimplexStep1(){
		iteration++;
		// знаходимо провідний рядок
		var min_k_num = minelm(free, true, true);

		// знаходимо провідний стовпець
		var min_k1 = minelm(free)
		if (minelm(matrix[min_k_num]) < 0){
			var min_k1_num = minelm(matrix[min_k_num], true, true);
		}else{
			alert('Умова задачі несумісна та рішень немає');
			return false;
		}

		print_table(matrix, min_k_num, min_k1_num);// Друкуємо таблицю та виділяємо на ній провідні рядок та стовпець
		// Оновлюємо індекси елементів по горизонталі та вертикалі
		tmp = horisont_x[min_k1_num];
		horisont_x[min_k1_num] = vertical_x[min_k_num];
		vertical_x[min_k_num] = tmp;

		//Заміна
		update_matrix(min_k_num, min_k1_num);
		//Матриця вільних членів
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][maximum_x];
		}
		if (minelm(free, false, true) < 0 && iteration < 10)
			SimplexStep1();
	}

	function SimplexStep2(){
		iteration++;
		// знаходимо провідний стовпець
		var min_col_num = minelm(matrix[matrix.length-1], true, true);
		// знаходимо провідний стовпець
		var cols_count = matrix[0].length -1;
		var min_row_num = 999;
		var min_row = 9999;
		var tmp = 0;
		for (i = 0; i< matrix.length-1; i++){
			tmp = free[i]/matrix[i][min_col_num];
			if (tmp < min_row && tmp>=0){
				min_row_num = i;
				min_row = tmp;
			}
		}
		min_k1_num = min_col_num;
		min_k_num = min_row_num;
		print_table(matrix, min_k_num, min_k1_num, free);
		tmp = horisont_x[min_k1_num];
		horisont_x[min_k1_num] = vertical_x[min_k_num];
		vertical_x[min_k_num] = tmp;
		if (min_row_num == 999){
			alert('Функція в бласті допустимих рішень задачі не обмежена');
			return false;
		}

		update_matrix(min_k_num, min_k1_num);
		for (var k=0; k < matrix.length; k++){
			free[k] = matrix[k][maximum_x];
		}
		if (minelm(matrix[matrix.length-1], false, true) < 0 && iteration < 10)
			SimplexStep2();
		}

	// Функція заміни (оновлення матриці)
	function update_matrix(min_k_num, min_k1_num){
		var matrix1 = new Array();
		for (i = 0; i< matrix.length; i++){
			matrix1[i] = new Array()
			for (j = 0; j< matrix[0].length; j++){
				if (i == min_k_num && j ==min_k1_num){
					matrix1[i][j] = 1/matrix[i][j];
				}else{
					if (i == min_k_num){
						matrix1[i][j] = matrix[i][j] * 1/matrix[min_k_num][min_k1_num];
					}else{
						if (j == min_k1_num){
							matrix1[i][j] = -matrix[i][j] * 1/matrix[min_k_num][min_k1_num];
						}else{
							matrix1[i][j] = matrix[i][j] - matrix[i][min_k1_num]*matrix[min_k_num][j]/matrix[min_k_num][min_k1_num];
						}
					}
				}
				matrix1[i][j] = Math.round(matrix1[i][j]*1000)/1000;
			}
		}
		matrix = matrix1;
	return false;
	}

	function results() {
		var nulls = '';
		// Ікси, рівні нулю
		for (var i = 0; i < horisont_x.length - 1; i++) {
			if (horisont_x[i] < maximum_x) {
				nulls += '<i>x</i><sub>' + (horisont_x[i] + 1) + '</sub>=';
			}
		}
		nulls += '0 <br /><br />';
		// Ікси, рівні нулю
		var vars = '';
		for (var i = 0; i < vertical_x.length; i++) {
			if (vertical_x[i] < maximum_x) {
				vars += '<i>x</i><sub>' + (vertical_x[i] + 1) + '=' + matrix[i][maximum_x] + '</sub><br />';
			}
		}
		// Мінімум(максимум) функції
		var main_result = '';
		if ($('.equation select').val() > 0) {
			main_result = '<i>F<sub>min</sub></i>=' + (matrix[matrix.length - 1][maximum_x] * -1);
		} else {
			main_result = '<i>F<sub>max</sub></i>=' + matrix[matrix.length - 1][maximum_x];
		}
		$('#result').append(nulls + vars + '<br />' + main_result);
		return false;
	}

})

function print_table(arr, row, col, free){
	var max_i = arr.length;
	var max_j = arr[0].length;
	var html_table = '';
	var html_headC = '<th>C</th>';
	var html_head = '<th>B</th>';

	html_headC +='<th>-</th>'
	for (var j = 0; j < max_j-1; j++) {
		html_headC +='<th>' + Fun[j]*-1 + '</th>'
	}

	html_head +='<th><i>A</i><sub>0</sub></th>'
	for (var j = 0; j < max_j-1; j++) {
		html_head +='<th><i>A</i><sub>'+(horisont_x[j]+1)+'</sub></th>'
	}


	html_head ='<thead><tr>'+html_headC+'</tr><tr>'+html_head+'</tr></thead>';

	for (let i = 0; i < arr.length; i++) {
		let temp = arr[i][0];
		arr[i][0] = arr[i][arr[i].length - 1];
		arr[i][arr[i].length - 1] = temp;
	}
	for (var i = 0; i < max_i; i++) {
		html_table +='<tr>';
		if (!(i == max_i-1)){
			html_table +='<th><i>x</i><sub>'+(vertical_x[i]+1)+'</sub></th>';
		}else{
			html_table +='<th><i>&#916</i></th>';
		}
		for (var j = 0; j < max_j; j++) {
			html_table +='<td>'+arr[i][j]+'</td>'
		}
		html_table +='</tr>';
	}
	for (let i = 0; i < arr.length; i++) {
		let temp = arr[i][0];
		arr[i][0] = arr[i][arr[i].length - 1];
		arr[i][arr[i].length - 1] = temp;
	}


	// Виділяємо колонку, якщо вказано
	$('#result').append('<table>'+html_head+html_table+'</table>');
	if (col !== undefined)
		$('table:last tr').each(function(){
			$(this).children('td').eq(col == 0 ? arr[0].length-1 : col).addClass('selected');
		})
	// Виділяємо рядок, якщо вказано
	if (row !== undefined)
		$('table:last tr').eq(row+2).addClass('selected');
}

function minelm(v, dispnum, not_last){
	var m= v[0];
	var num= 0;
	var len=0;
	if (not_last){
		len = v.length-2;
	}else{
		len = v.length-1;
	}
	for (var i=1; i <= len; i++){
		if (v[i] < m ){
			m= v[i];
			num = i
		}
	}
	if (dispnum){
		return num
	}else{
		return m
	}
}
