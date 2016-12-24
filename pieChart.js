var PieChart = function( config ){ this.init( config ); };
PieChart.prototype = extend( Chart, {
	constructor: PieChart,

	_arcsOffset: -Math.PI / 2, // -90deg in rad

	init: function( config ){
		if( !this._setVars( config ) ) return;
		this._buildArcs();
		this._loadImg();
	},

	_buildArcs: function(){
		var $this = this;

		this._sum = 0;

		this._each( this._data, function( key, val ){
			$this._sum += val.val;
		} );		

		this._arcsArr = [];
		var arcData, arcOffset = this._arcsOffset;
		this._each( this._data, function( key, val ){
			arcData = val;
			arcData.angle = $this._getRad( val.val, $this._sum );
			arcData.offset = arcOffset;
			$this._arcsArr.push( new PieChartArc( $this, arcData ) );
			arcOffset += arcData.angle;
		} );

	},

	_loadImg: function(){
		var $this = this;

		this._img = new Image();
		this._img.onload = function(){

			window._ChartCore.addChart( $this );

		};		
		this._img.src = 'img/mm.jpg';
	},

	_drawChart: function( ctx ){
		this._each( this._arcsArr, function( key, val ){
			val.render();
		} );
	}

} );

var PieChartArc = function( chart, data ){ this.init( chart, data ); };
PieChartArc.prototype = {
	constructor: PieChartArc,

	init: function( chart, data ){
		if( !this._setVars( chart, data) ) return;
	},

	_setVars: function( chart, data ){
		// this._chart = chart;
		this._ctx = chart._ctx;
		if( !data ) return false;
		this._val = data.val || 0;
		this._angle = data.angle || 0;
		this._offset = data.offset || 0;
		this._color = data.color || '#000';
		this._img = data.img || null;
		this._canvas = chart._canvas;

		this._arc = {};
		this._arc.b = this._offset;
		this._arc.e = this._offset + this._angle;

		this._imgReady = false;

		return true;
	},

	setOffset: function( offset ){
		this._offset = offset;

		this._arc.b = this._offset;
		this._arc.e = this._offset + this._angle;
	},

	update: function( t ){

	},

	render: function(){
		this._drawArc( this._ctx, 80, 140 );

		this._ctx.save(); // alpha

		this._ctx.globalAlpha = 0.5;
		this._drawArc( this._ctx, 140, 160 );

		this._ctx.restore(); // alpha
	},

	_drawArc: function( ctx, ai, ao ){

		ctx.save(); // arc

		ctx.beginPath();
		ctx.arc( this._canvas.cx, this._canvas.cy, ao, this._arc.b, this._arc.e, false );
		// ctx.lineTo( this._canvas.cx, this._canvas.cy ); // full pie
		ctx.arc( this._canvas.cx, this._canvas.cy, ai, this._arc.e, this._arc.b, true ); // arc pie

		ctx.save(); // img

		ctx.clip();
		if( this._imgReady ){
			ctx.drawImage( this._img, 0, 0, this._img.height, this._img.height, 0, 0, this._canvas.w, this._canvas.h );
			ctx.globalCompositeOperation = 'color';
		}
		ctx.fillStyle = this._color;
		ctx.fillRect( 0, 0, this._canvas.w, this._canvas.h );
		
		ctx.restore(); // img

		ctx.restore(); // arc

	}

};
