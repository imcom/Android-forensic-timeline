/*
 *
 * default route handler
 *
 */

exports.imcom = function(req, res){
    res.render("imcom",
                {
                    title: "Forensic"
                }
            );
};
