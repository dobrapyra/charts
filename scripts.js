
( function(){

	var chartConfig = {
		id: "chart",
		title: "Test Chart",
		data: [
			{ val: 10, color: '#00a0dc', label: 'val01', img: 'img/mm.jpg' },
			{ val: 20, color: '#a487ba', label: 'val02', img: 'img/mm.jpg' },
			{ val: 30, color: '#ef6c5a', label: 'val03', img: 'img/mm.jpg' },
			{ val: 40, color: '#e68523', label: 'val04', img: 'img/mm.jpg' },
			{ val: 50, color: '#00aeb3', label: 'val05', img: 'img/mm.jpg' },
			{ val: 60, color: '#edb220', label: 'val06', img: 'img/mm.jpg' },
			{ val: 70, color: '#ee62a2', label: 'val07', img: 'img/mm.jpg' },
			{ val: 80, color: '#7cb82f', label: 'val08', img: 'img/mm.jpg' },
			{ val: 90, color: '#86888a', label: 'val09', img: 'img/mm.jpg' }
		],
		// sum: 1000,
		size: {
			ri: 80,
			ro: 140,
			r2i: 140,
			r2o: 160
		},
		time: {
			show: 1000,
			hide: 500,
			mouseenter: 300,
			mouseleave: 200
		},
		event: {
			hoverChange: function( data ){
				if( data !== null ){
					// console.log( 'hoverChange: ' + data.val + ' - ' + data.label );
					console.log( '%c' + 'hoverChange: ' + '%c' + data.val + ' - ' + data.label , '', 'color: ' + data.color );
				}else{
					console.log( 'hoverChange: null' );
				}
			},
			click: function( data ){
				// console.log( 'click: ' + data.val + ' - ' + data.label );
				console.log( '%c' + 'click: ' + '%c' + data.val + ' - ' + data.label , '', 'color: ' + data.color );
			}
		}
	};
	new PieChart( chartConfig );
	
} )();
