//Is the script active?
var active = false;

//A variable to store the mcpe activity
var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

// Are we showing chunk coords
var showingChunks = false;
var chunksActive  = false;

// Current position
var currentX = 0;
var currentY = 0;
var currentZ = 0;

var currentChunkX = 0;
var currentChunkZ = 0;

// Have we already found diamond here?
var knowAboutDiamondInCurrentChunk = false;
var positionOfDiamondInCurrentChunk = -1;

function procCmd(cmd) {
	names = [];
	ids = [];
	data = [];

	var params = cmd.toLowerCase().split(" ");
	var evalParams = cmd.split(" ");
	var moarData;
	var dataValues;
	ctx.runOnUiThread(
	    new java.lang.Runnable(
	    { 
	        run: function() {
		        main(params);
	        }
	    })
	);
}

function main(p) {
	switch(p[0]) {
		case "help":
		case "?":
			switch(p[1]) {
				case "chunks":
					showHelp("chunks", "Shows coords and chunk coords", "", "");
					break;
				case "help":
				case "?":
					showHelp("help", "Shows help", "", "");
					break;
			}
			break;
		case "chunks":
		case "coordinates":
			if(showingChunks) {
				dismissChunks();
				colourMsg("Showing chunks is §binactive§f!");
			}
			else {
				colourMsg("Showing chunks is §bactive§f!");
				showingChunks = true;
			}
			break;
		case "nodiamond" :
		case "nodiamonds" :
		    clientMessage("no diamonds here");
		    break;
	}
}

function modTick() {
    if(active === false) {

        loadDiamondInfoForChunk(currentChunkX, currentChunkZ);

        // Any startup needed?
        active = true;
    }

    if(showingChunks) {

        var newX = Player.getX()
        var newY = Player.getY();
        var newZ = Player.getZ();

        var newChunkX = getChunkForCoord(newX);
        var newChunkZ = getChunkForCoord(newZ);

		ctx.runOnUiThread(new java.lang.Runnable({ run: function() {
			try {
				if(!chunksActive) {
				    window = new android.widget.PopupWindow();
					var layout = new android.widget.RelativeLayout(ctx);
					textview = new android.widget.TextView(ctx);
					textview.setTextSize(25);
					textview.setTextColor(android.graphics.Color.GRAY);
					layout.addView(textview);
					window.setContentView(layout);
					window.setWidth(dip2px(ctx, 100));
					window.setHeight(dip2px(ctx, 100));
					window.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
					window.showAtLocation(ctx.getWindow().getDecorView(), android.view.Gravity.LEFT | android.view.Gravity.TOP, dip2px(ctx, 5), dip2px(ctx, 40));
					chunksActive = true;
				}

                if(newChunkX != currentChunkX || newChunkZ != currentChunkZ) {
                	// We have moved chunk, reload
                    loadDiamondInfoForChunk(newChunkX, newChunkZ);
                }

                var prefix = "";                    

                if(knowAboutDiamondInCurrentChunk) {

                    if(positionOfDiamondInCurrentChunk == -1) {
                        prefix = "x";
                    } else {
                    	prefix = "f";
                    }
                } else {
                	prefix = "?"
                }

				textview.setText(prefix + "X: " + Math.floor(newX) + " (" + Math.floor(Player.getX() / 16) + ")" + "\n" + 
				                 prefix + "Y: " + Math.floor(newY) + "\n" + 
				                 prefix + "Z: " + Math.floor(newZ) + " (" + Math.floor(Player.getZ() / 16) + ")");
			}
			catch(e){
				errorMsg("Line 108: " + e);
			}
		}}));
	}

	currentX = newX;
	currentY = newY;
	currentZ = newZ;
    
    currentChunkX = newChunkX;
    currentChunkZ = newChunkZ;
}

function loadDiamondInfoForChunk(chunkX, chunkZ) {

    if( chunkX = chunkZ) {
		knowAboutDiamondInCurrentChunk = false;
		positionOfDiamondInCurrentChunk = -1;
	} else 	if( chunkX > chunkZ) {
		knowAboutDiamondInCurrentChunk = true;
		positionOfDiamondInCurrentChunk = -1;
	} else {
        knowAboutDiamondInCurrentChunk = true;
		positionOfDiamondInCurrentChunk = 5;		
	}

    // TODO
	// load value from pref file

	// if value == "", unknown
	// if value == "-1", no diamond here
	// else diamond was here at y=value
}

function saveDiamondInfoForChunk(chunkX, chunkZ, y) {
    //ModPE.saveData(worldanme + "-" + chunkX + "-" + chunkZ, y)
}

function dismissChunks() {
	showingChunks = false;
	chunksActive = false;

    currentX = 0;
    currentY = 0;
    currentZ = 0;

    currentChunkX = 0;
    currentChunkZ = 0;

    knowAboutDiamondInCurrentChunk = false;
    positionOfDiamondInCurrentChunk = -1;

	ctx.runOnUiThread(new java.lang.Runnable({ run: function() {
		window.dismiss();
	}}));
}

function leaveGame() {
	if(showingChunks) {
		dismissChunks();
	}
}

function useItem(x,y,z,itemId,blockId,side) {
	if (blockId==56) {
        clientMessage("You touched diamond");

        // TODO If there isn't a file for this chunk, create it
        knowAboutDiamondInCurrentChunk = true;
        positionOfDiamondInCurrentChunk = y;
    }

    if (blockId==16) {
    	// TODO remove
        clientMessage("You touched coal");
    }
}