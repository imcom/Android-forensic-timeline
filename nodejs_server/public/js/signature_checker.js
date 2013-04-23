

var relevant_system_calls = [
        ["ActivityManager", "am_proc_start"],
        ["ActivityManager", "am_proc_died"]
    ];
// check a given sig is known or not, return index if known, return -1 otherwise
function isSignatureKnown(base, target) {
    var confidence = []; // [confidence on A, confidence on B]

    if (base.length === 0) return -1; // no signature recorded yet
    for (var index = 0; index < base.length; index ++) {
        confidence[0] = compareSignatures(base[index][0], target[0]);
        confidence[1] = compareSignatures(base[index][1], target[1]);
        if (confidence[0] > 0 && confidence[1] > 0) {
            return index;
        }
    }
    return -1;
}

function compareSignatures(cmp_sig, target_sig) {
    if (cmp_sig[0] === target_sig[0]) {
        return compareSignatureTokens(cmp_sig, target_sig);
    } else {
        var irrelevant = true;
        for (var index in relevant_system_calls) {
            if (index === undefined) continue;
            if (_.difference([cmp_sig[0], target_sig[0]], relevant_system_calls[index]).length === 0) {
                return compareSignatureTokens(cmp_sig, target_sig);
            }
        }
        if (irrelevant) {
            return -Math.max(cmp_sig.length, target_sig.length);
        }
    }
}

function compareSignatureTokens(cmp_sig, target_sig) {
    var cmp_object = cmp_sig[0];
    var target_object = target_sig[0]; // not used
    var cmp_tokens = [];
    var target_tokens = [];
    for (var i = 1; i < cmp_sig.length; i++) cmp_tokens.push(cmp_sig[i]);
    for (var i = 1; i < target_sig.length; i++) target_tokens.push(target_sig[i]);
    var commons = _.intersection(cmp_tokens, target_tokens);
    var diffs = _.difference(cmp_tokens, target_tokens);
    // check the diffs depending on system call
    if (diffs.length === 0) return commons.length;
    for (var _diff_index in diffs) {
        //TODO put more criteria here
        if (cmp_object === "am_proc_start" ||
            cmp_object === "am_proc_died" ||
            cmp_object === "ActivityManager"
        ) {
            if (diffs[_diff_index].indexOf("pid") !== -1) {
                return -Math.max(cmp_sig.length, target_sig.length);
            }
        }
    }
    return commons.length - diffs.length;
}




