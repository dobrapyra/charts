/* Object.create by Douglas Crockford */
if( typeof Object.create !== 'function' ){
  Object.create = function( o ){
    function F(){}
    F.prototype = o;
    return new F();
  };
}

/* extendObj */
function extendObj( a, b ){
  var k;
  for( k in b ){
    // if(b.hasOwnProperty(k)){
    //   a[k] = b[k];
    // }
    a[k] = b[k];
  }
  return a;
}

/* extend */
function extend( P, C ){
  return extendObj( Object.create( P.prototype ), C );
}

/* requestAnimFrame */
window.requestAnimFrame = ( function(){
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function( cb ){
    return window.setTimeout( cb, 1000 / 60 );
  };
} )();

/* cancelRequestAnimFrame */
window.cancelRequestAnimFrame = ( function(){
  return window.cancelAnimationFrame ||
  window.webkitCancelRequestAnimationFrame ||
  window.mozCancelRequestAnimationFrame ||
  window.oCancelRequestAnimationFrame ||
  window.msCancelRequestAnimationFrame ||
  clearTimeout;
} )();

/* performance.now */
window.performance = window.performance = {};
window.performance.now = ( function(){
  return window.performance.now ||
  function(){
    return new Date().getTime();
  };
} )();

var ChartCore = function(){ this.init(); };
ChartCore.prototype = {
	constructor: ChartCore,

	_each: function( arr, fn ){
		if( !arr.length ) return;
		if( typeof fn != 'function' ) return;
		var i;
		for( i = 0; i < arr.length; i++ ){
			fn( i, arr[i] );
		}
	},

	_getOffset: function( el ){
		if( !el ) return { l: 0, t: 0 };
		var eOff = { l: el.offsetLeft, t: el.offsetTop };
		var pOff = this._getOffset( el.offsetParent );
		return { l: eOff.l + pOff.l, t: eOff.t + pOff.t };
	},

	init: function(){
		this._setVars();
		this._startLoop();

		var $this = this;
		setTimeout( function(){
			$this._stopLoop();
		}, 10000 );
	},

	_setVars: function(){
		this._chartsArr = [];
		this._raf = null;
		this._inLoop = false;
    this._fr = true; // frame ready
	},

	_loop: function(){
		var $this = this;

		this._raf = window.requestAnimFrame( function(){ $this._loop(); } );
		if( !this._fr ){ return; }
		this._fr = false;
		this._t = window.performance.now;
		this._update( this._t );
		this._render();
		this._fr = true;
	},

	_startLoop: function(){
		var $this = this;

		if( this._inLoop ){ return; }
		this._inLoop = true;
		this._raf = window.requestAnimFrame( function(){ $this._loop(); } );
	},

	_stopLoop: function(){
		window.cancelRequestAnimFrame( this._raf );
		this._raf = null;
		this._inLoop = false;
	},

	_update: function( t ){
		this._each( this._chartsArr, function( key, val ){
			val.update( t );
		} );
	},

	_render: function(){
		this._each( this._chartsArr, function( key, val ){
			val.render();
		} );
	},

	addChart: function( chart ){
		this._chartsArr.push( chart );
	},

	removeChart: function( chart ){
		this._chartsArr.splice( this._chartsArr.indexOf( chart ), 1 );
	}

};
window._ChartCore = new ChartCore();
