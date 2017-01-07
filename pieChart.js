var PieChart = function( config ){ this.init( config ); };
PieChart.prototype = extend( Chart, {
	constructor: PieChart,

	_offset: -Math.PI / 2, // -90deg in rad

	_createPart: function( chart, partData ){
		return new PieChartPart( chart, partData );
	},

	_getRelVal: function( val, sum ){
		return this._getRad( val, sum );
	},

	_getRad: function( val, sum ){
		return val / sum * 2 * Math.PI;
	}

} );

var PieChartPart = function( chart, data ){ this.init( chart, data ); };
PieChartPart.prototype = extend( ChartPart, {
	constructor: PieChartPart,

	_setStateVars: function( data ){
		var relVal = data.relVal || 0;

		this._state = {
			b: {
				val: 0,
			},
			e: {
				val: relVal,
			},
			c: {
				val: relVal,
				arc: {
					b: this._offset,
					e: this._offset + relVal
				}
			}
		};
	},

	update: function( t ){
		if( !this._ready ) return;

		this._checkHover( this._ctx, this._cursor.pos );
	},

	render: function(){
		if( !this._ready ) return;

		this._drawArc0();
		this._drawArc1();
	},

	_drawArc0: function(){
		this._drawArc( this._ctx, this._size.ri, this._size.ro, this._img );
	},

	_drawArc1: function(){
		this._ctx.save(); // alpha

		if( this._hover ){
			this._ctx.globalAlpha = 1;
		}else{
			this._ctx.globalAlpha = 0.5;
		}
		// this._ctx.globalAlpha = 0.5;
		this._drawArc( this._ctx, this._size.r2i, this._size.r2o, null );

		this._ctx.restore(); // alpha
	},

	_drawArc: function( ctx, ri, ro, img ){

		ctx.save(); // arc

		ctx.beginPath();
		ctx.arc( this._canvas.cx, this._canvas.cy, ro, this._state.c.arc.b, this._state.c.arc.e, false );
		if( ri > 0 ){ // arc pie
			ctx.arc( this._canvas.cx, this._canvas.cy, ri, this._state.c.arc.e, this._state.c.arc.b, true );
		}else{ // full pie
			ctx.lineTo( this._canvas.cx, this._canvas.cy );
		}

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

	},

	_checkHover: function( ctx, pos ){

		ctx.save();

		ctx.beginPath();
		ctx.arc( this._canvas.cx, this._canvas.cy, this._size.r2o, this._state.c.arc.b, this._state.c.arc.e, false );
		if( this._size.ri > 0 ){ // arc pie
			ctx.arc( this._canvas.cx, this._canvas.cy, this._size.ri, this._state.c.arc.e, this._state.c.arc.b, true );
		}else{ // full pie
			ctx.lineTo( this._canvas.cx, this._canvas.cy );
		}

		this._hover = ctx.isPointInPath( pos.x, pos.y );

		ctx.restore();

	}

} );
