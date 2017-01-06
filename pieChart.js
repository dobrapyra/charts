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
				arc: {
					b: this._offset,
					e: this._offset
				}
			},
			e: {
				arc: {
					b: this._offset,
					e: this._offset + relVal
				}
			},
			c: {
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

		this._drawArc( this._ctx, 80, 140, this._img );

		this._ctx.save(); // alpha

		if( this._hover ){
			this._ctx.globalAlpha = 1;
		}else{
			this._ctx.globalAlpha = 0.5;
		}
		// this._ctx.globalAlpha = 0.5;
		this._drawArc( this._ctx, 140, 160, null );

		this._ctx.restore(); // alpha
	},

	_drawArc: function( ctx, ai, ao, img ){

		ctx.save(); // arc

		ctx.beginPath();
		ctx.arc( this._canvas.cx, this._canvas.cy, ao, this._state.c.arc.b, this._state.c.arc.e, false );
		// ctx.lineTo( this._canvas.cx, this._canvas.cy ); // full pie
		ctx.arc( this._canvas.cx, this._canvas.cy, ai, this._state.c.arc.e, this._state.c.arc.b, true ); // arc pie

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
		ctx.arc( this._canvas.cx, this._canvas.cy, 160, this._state.c.arc.b, this._state.c.arc.e, false );
		// ctx.lineTo( this._canvas.cx, this._canvas.cy ); // full pie
		ctx.arc( this._canvas.cx, this._canvas.cy, 80, this._state.c.arc.e, this._state.c.arc.b, true ); // arc pie

		this._hover = ctx.isPointInPath( pos.x, pos.y );

		ctx.restore();

	}

} );
