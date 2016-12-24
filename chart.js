var Chart = function( config ){ this.init( config ); };
Chart.prototype = {
	constructor: Chart,

	init: function( config ){
		if( !this._setVars( config ) ) return;
		window._ChartCore.addChart( $this );
	},

	_setVars: function( config ){
		if( !window._ChartCore ) return false;
		if( !config ) return false;

		this._id = config.id || null;
		if( !this._id ) return false;

		this._canvasEl = document.getElementById( this._id );
		if( !this._canvasEl ) return false;
		this._ctx = this._canvasEl.getContext( '2d' );

		this._data = config.data || [];
		this._title = config.title || '';

		this._canvas = {};
		this._canvas.w = this._canvasEl.getAttribute( 'width' ) || 320;
		this._canvas.h = this._canvasEl.getAttribute( 'height' ) || 320;
		this._canvas.cx = this._canvas.w / 2;
		this._canvas.cy = this._canvas.h / 2;

		return true;
	},

	_each: function( arr, fn ){
		if( !arr.length ) return;
		if( typeof fn != 'function' ) return;
		var i;
		for( i = 0; i < arr.length; i++ ){
			fn( i, arr[i] );
		}
	},

	update: function( t ){

	},

	render: function(){
		this._clear();

		this._drawChart( this._ctx );
	},

	_clear: function(){
		this._ctx.clearRect( 0, 0, this._canvas.w, this._canvas.h );
	},

	_drawChart: function( ctx ){

	},

	// _degToRad: function( deg ){
	// 	return deg * Math.PI / 180;
	// },

	// _radToDeg: function( rad ){
	// 	return rad * 180 / Math.PI;
	// },

	// _perToRad: function( per ){
	// 	return per * 2 * Math.PI / 100;
	// },

	// _perToDeg: function( per ){
	// 	return per * 360 / 100;
	// },

	_getRad: function( val, sum ){
		return val / sum * 2 * Math.PI;
	}

};