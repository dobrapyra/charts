var PieChart = function( config ){ this.init( config ); };
PieChart.prototype = extend( Chart, {
	constructor: PieChart,

	_ready: false,
	_arcsOffset: -Math.PI / 2, // -90deg in rad

	init: function( config ){
		if( !this._setVars( config ) ) return;
		this._setEvents();
		this._buildArcs();
		this.checkReady();
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

	checkReady: function(){
		var allReady = true;
		this._each( this._arcsArr, function( key, val ){
			if( !val.checkReady() ){
				allReady = false;
				return false;
			}
		} );

		if( allReady ){
			this._ready = true;
			window._ChartCore.addChart( this );
		}
	},

	update: function( t ){
		if( !this._ready ) return;
		this._each( this._arcsArr, function( key, val ){
			val.update();
		} );
	},

	_drawChart: function( ctx ){
		if( !this._ready ) return;
		this._each( this._arcsArr, function( key, val ){
			val.render();
		} );
	}

} );

var PieChartArc = function( chart, data ){ this.init( chart, data ); };
PieChartArc.prototype = {
	constructor: PieChartArc,

	_ready: false,
	_imgReady: false,

	init: function( chart, data ){
		if( !this._setVars( chart, data) ) return;
	},

	_setVars: function( chart, data ){
		this._chart = chart;
		this._ctx = chart._ctx;
		if( !data ) return false;
		this._val = data.val || 0;
		this._angle = data.angle || 0;
		this._offset = data.offset || 0;
		this._color = data.color || '#000';
		this._imgSrc = data.img || null;
		this._canvas = chart._canvas;

		this._arc = {};
		this._arc.b = this._offset;
		this._arc.e = this._offset + this._angle;

		this._loadImage();
		// this._ready = true;

		return true;
	},

	_loadImage: function(){
		var $this = this;

		if( !this._imgSrc ){ // no img

			this._img = null;
			this._ready = true;
			this._chart.checkReady();

		}else{ // img

			this._img = new Image();
			this._img.onload = function(){
				$this._imgReady = true;
				$this._ready = true;
				$this._chart.checkReady();
			};	
			this._img.src = this._imgSrc;

		}
	},

	checkImgReady: function(){
		return this._imgReady;
	},

	checkReady: function(){
		return this._ready;
	},

	setOffset: function( offset ){
		this._offset = offset;

		this._arc.b = this._offset;
		this._arc.e = this._offset + this._angle;
	},

	update: function( t ){

	},

	render: function(){
		if( !this._ready ) return;

		this._drawArc( this._ctx, 80, 140, this._img );

		this._ctx.save(); // alpha

		this._ctx.globalAlpha = 0.5;
		this._drawArc( this._ctx, 140, 160, null );

		this._ctx.restore(); // alpha
	},

	_drawArc: function( ctx, ai, ao, img ){

		ctx.save(); // arc

		ctx.beginPath();
		ctx.arc( this._canvas.cx, this._canvas.cy, ao, this._arc.b, this._arc.e, false );
		// ctx.lineTo( this._canvas.cx, this._canvas.cy ); // full pie
		ctx.arc( this._canvas.cx, this._canvas.cy, ai, this._arc.e, this._arc.b, true ); // arc pie

		ctx.save(); // img

		ctx.clip();
		if( img !== null && this._imgReady ){
			ctx.drawImage( img, 0, 0, img.height, img.height, 0, 0, this._canvas.w, this._canvas.h );
			ctx.globalCompositeOperation = 'color';
		}
		ctx.fillStyle = this._color;
		ctx.fillRect( 0, 0, this._canvas.w, this._canvas.h );
		
		ctx.restore(); // img

		ctx.restore(); // arc

	}

};
