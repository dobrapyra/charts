var PieChart = function( config ){ this.init( config ); };
PieChart.prototype = extend( Chart, {
	constructor: PieChart,

	init: function( config ){
		if( !this._setVars( config ) ) return;
		this._buildArcs();
		this._loadImg();
	},

	_buildArcs: function(){
		var $this = this;

		this._offset = -Math.PI / 2; // -90deg in rad

		this._arcsArr = [];
		var arcData, arcOffset = this._offset;
		this._each( this._data, function( key, val ){
			arcData = val;
			arcData.val = $this._perToRad( arcData.val );
			arcData.offset = arcOffset;
			$this._arcsArr.push( new PieChartArc( $this, arcData ) );
			arcOffset += arcData.val;
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
		this._color = data.color || '#000';
		this._img = data.img || null;
		this._offset = data.offset || 0;

		this._imgReady = false;

		this._c = chart._c;

		return true;
	},

	setOffset: function( offset ){
		this._offset = offset;
	},

	update: function( t ){

	},

	render: function(){
		this._drawArc( this._ctx );
	},

	_drawArc: function( ctx ){

		var arc = {};
		arc.b = this._offset;
		arc.e = this._offset + this._val;

		var c = {};
		c.x = this._c.w / 2;
		c.y = this._c.h / 2;

		// var cImg = {};
		// cImg.x = this._img.width / 2;
		// cImg.y = this._img.height / 2;

		ctx.save(); // arc

		ctx.beginPath();
		ctx.arc( c.x, c.y, 160, arc.b, arc.e, false );
		// ctx.lineTo( c.x, c.y ); // full pie
		ctx.arc( c.x, c.y, 50, arc.e, arc.b, true ); // arc pie

		ctx.save(); // img

		ctx.clip();
		if( this._img && this._imgReady ){
			ctx.drawImage( this._img, 0, 0, this._img.height, this._img.height, 0, 0, this._c.w, this._c.h );
			ctx.globalCompositeOperation = 'color';
		}
		ctx.fillStyle = this._color;
		ctx.fillRect( 0, 0, this._c.w, this._c.h );
		
		ctx.restore(); // img

		ctx.restore(); // arc

	}

};
