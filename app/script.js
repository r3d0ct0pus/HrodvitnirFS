const $ = jQuery = require("../js/jquery-3.3.1.min.js");
const fs = require('fs');
const sqlite3 = require("sqlite3").verbose();

const database_file = __dirname + '/db.sqlite3'
const db = new sqlite3.Database(database_file);

//create database or
(function(){if (fs.existsSync(database_file)) {

}else{
  db.run('create table if not exists filedata'+
    ' (fileID integer primary key, filename text, fullpath text unique)'
  );
  db.run('create table if not exists tag'+
    ' (tagID integer primary key, tagname text, folderID integer)'
  );
  db.run('create table if not exists treefolder'+
    ' (folderID integer primary key, treefoldername text)'
  );
  db.run('create table if not exists taggingfiles'+
    '(taggingfileID integer primary key, tagID integer, fileID integer)'
  );
}})();
//UIconfig
var config = {
  layout: {
      name: 'layout',
      padding: 0,
      panels: [
          { type: 'left', size: 200, resizable: true, minSize: 120 },
          { type: 'main', minSize: 550, overflow: 'hidden' }
      ]
  },
  sidebar: {
        name: 'sidebar',
        nodes: [
          {id: 'sall', text: 'All Files'},
          { id: 'level-2', text: 'Level 2', img: 'icon-folder', expanded: true,

            nodes: [ { id: 'level-2-1', text: 'Level 2.1', img: 'icon-folder', count: 4,
                         nodes: [
                         { id: 'level-2-1-1', text: 'Level 2.1.1', icon: 'fa-star-empty' },
                         { id: 'level-2-1-2', text: 'Level 2.1.2', icon: 'fa-star-empty', count: 67 },
                         { id: 'level-2-1-3', text: 'Level 2.1.3', icon: 'fa-star-empty' }
                     ]},
                     { id: 'level-2-2', text: 'Level 2.2', icon: 'fa-star-empty' },
                     { id: 'level-2-3', text: 'Level 2.3', icon: 'fa-star-empty' },

                   ]
          }
        ],
  },
  grid: {
        name: 'grid',
        show: {
            footer    : true,
            toolbar    : true
        },
        columns: [

            { field: 'fname', caption: 'FileName', size: '120px', resizable: true, sortable: true },
            { field: 'fpath', caption: 'Path', size: '120px', resizable: true, sortable: true }
        ]
  }
};

$(function () {
    // initialization
    $('#main').w2layout(config.layout);
    w2ui.layout.content('left', $().w2sidebar(config.sidebar));
    w2ui.layout.content('main', $().w2grid(config.grid));
    // generate data
    var fl      = require('node-filelist');
    var files   = [ "/home/juliet/Documents" ];
    var option  = {  };

    fl.read(files, option , function (results){
      for(var i=0; i<results.length; i++){
//        w2ui['grid'].records.push({
//          recid : i+1,
//          fpath: results[i].path,
//          fname: results[i].path.substring(
//            results[i].path.lastIndexOf('/')+1, results[i].path.length
//          )
//        });
        db.serialize(function (){
          db.exec('BEGIN TRANSACTION');
          var stmt = db.prepare(
            "INSERT OR IGNORE INTO filedata (filename,fullpath) VALUES (?,?)"
          );
          stmt.run(
            [
              results[i].path.substring(
                results[i].path.lastIndexOf('/')+1, results[i].path.length
              ),results[i].path
            ]
          );
          stmt.finalize();
          db.exec("COMMIT");
        });
      }


//      w2ui.grid.refresh();
    });
    db.each("SELECT fileID, filename, fullpath FROM filedata", function (err, row) {
      w2ui['grid'].records.push({
        recid: row.fileID,
        fpath: row.fullpath,
        fname: row.filename
      });
//      w2ui.grid.refresh();
    });


//    $('#main').w2render('grid');
//    w2ui.grid.refresh();
});
