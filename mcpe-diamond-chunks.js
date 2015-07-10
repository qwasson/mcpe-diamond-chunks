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

var updateLabel = false;

// Have we already found diamond here?
var knowAboutDiamondInCurrentChunk = false;
var positionOfDiamondInCurrentChunk = "-1";

function procCmd(cmd) {
    var params = cmd.toLowerCase().split(" ");
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
                clientMessage("Showing chunks is inactive!");
            }
            else {
                clientMessage("Showing chunks is active!");
                showingChunks = true;
            }
            break;
        case "nodiamond" :
        case "nodiamonds" :
            knowAboutDiamondInCurrentChunk = true;
            positionOfDiamondInCurrentChunk = "-1"  
            saveDiamondInfoForChunk(getChunkForCoord(Player.getX()),getChunkForCoord(Player.getZ()),"");
            updateLabel = true;
            break;
        case "adddiamond":
        case "adddiamonds":    
            knowAboutDiamondInCurrentChunk = true;
            positionOfDiamondInCurrentChunk = "0"        
            saveDiamondInfoForChunk(getChunkForCoord(Player.getX()),getChunkForCoord(Player.getZ()),"0");
            updateLabel = true;
    }
}

function modTick() {
    if(active === false) {

        clientMessage("Activating chunks!");

        loadDiamondInfoForChunk(currentChunkX, currentChunkZ);

        // Any startup needed?
        active = true;
    }

    if(showingChunks) {

        ctx.runOnUiThread(new java.lang.Runnable({ run: function() {

            var newX = Player.getX();
            var newY = Player.getY();
            var newZ = Player.getZ();

            var newChunkX = getChunkForCoord(newX);
            var newChunkZ = getChunkForCoord(newZ);

            var reload = false;

            if(updateLabel || newChunkX != currentChunkX || newChunkZ != currentChunkZ) {
                reload = true;
            }

            updateLabel = false;

            try {
                if(!chunksActive) {
                    window = new android.widget.PopupWindow();
                    var layout = new android.widget.RelativeLayout(ctx);
                    textview = new android.widget.TextView(ctx);
                    textview.setTextSize(25);
                    textview.setTextColor(android.graphics.Color.GRAY);
                    layout.addView(textview);
                    window.setContentView(layout);
                    window.setWidth(dip2px(ctx, 200));
                    window.setHeight(dip2px(ctx, 100));
                    window.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
                    window.showAtLocation(ctx.getWindow().getDecorView(), android.view.Gravity.LEFT | android.view.Gravity.TOP, dip2px(ctx, 5), dip2px(ctx, 40));
                    chunksActive = true;
                }

                if(reload) {
                    // We have moved chunk, or the info has been updated, reload
                    loadDiamondInfoForChunk(newChunkX, newChunkZ);
                }

                var prefix = "";                    

                if(knowAboutDiamondInCurrentChunk) {

                    if(positionOfDiamondInCurrentChunk == "-1") {
                        prefix = "x";
                    } else {
                        prefix = "f";
                    }
                } else {
                    prefix = "?"
                }

                textview.setText(prefix + "X: " + Math.floor(newX) + " (" + getChunkForCoord(Player.getX()) + ")" + "\n" + 
                                 prefix + "Y: " + Math.floor(newY) + "\n" + 
                                 prefix + "Z: " + Math.floor(newZ) + " (" +getChunkForCoord(Player.getZ()) + ")");
            }
            catch(e){
                clientMessage("Line 108: " + e);
            }

            currentX = newX;
            currentY = newY;
            currentZ = newZ;
    
            currentChunkX = newChunkX;
            currentChunkZ = newChunkZ;

        }}));        
    }
}

function getChunkForCoord(coord) {
    return Math.floor(coord / 16);
}

function loadDiamondInfoForChunk(chunkX, chunkZ) {

    // load value from pref file
    var value = ModPE.readData(getPreferenceName(chunkX, chunkZ));

    if(value == "") {
        knowAboutDiamondInCurrentChunk = false;     // ?
        positionOfDiamondInCurrentChunk = "-1";     // N/A
    } else {
        knowAboutDiamondInCurrentChunk = true;      // x
        positionOfDiamondInCurrentChunk = value;     // 
    }

    //clientMessage("loadDiamondInfoForChunk: x: " + chunkX + "z: " + chunkZ + " know: " + knowAboutDiamondInCurrentChunk + " pos: " + positionOfDiamondInCurrentChunk);
}

function getPreferenceName(chunkX, chunkZ) {
    return Level.getWorldName() + "-" + chunkX + "-" + chunkZ;
}

function saveDiamondInfoForChunk(chunkX, chunkZ, y) {
    ModPE.saveData(getPreferenceName(chunkX, chunkZ), y)
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
    positionOfDiamondInCurrentChunk = "-1";

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
        if(knowAboutDiamondInCurrentChunk) {
            clientMessage("touched known diamond");
        } else {
            clientMessage("touched new diamond");
            // If there isn't a file for this chunk, create it
            knowAboutDiamondInCurrentChunk = true;
            positionOfDiamondInCurrentChunk = "" + y;
            updateLabel = true;
            saveDiamondInfoForChunk(getChunkForCoord(x),getChunkForCoord(z),"" + y);
        }
    }
}

function dip2px(ctx, dips) {
    return Math.ceil(dips * ctx.getResources().getDisplayMetrics().density);
}
