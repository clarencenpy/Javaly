JavaFiles = new FS.Collection('javaFiles', {
    stores: [new FS.Store.FileSystem('javaFiles', {})]
});

JavaFiles.allow({
    insert: function () {
        return true;
    },
    update: function () {
        return true;
    }
})