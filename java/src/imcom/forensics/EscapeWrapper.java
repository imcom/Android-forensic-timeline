package imcom.forensics;

public class EscapeWrapper {

	public static final String SPACE = " ";
	public static final String COMMA = ",";
	public static final String DOUBLE_QUOTE = "\"";
	public static final String NEW_LINE = "\n";
	public static final String CR = "\r";
	public static final String SPACE_REPLACER = "_";
	public static final String SINGLE_QUOTE = "'";
	public static final String NEW_LINE_REPLACER = "\\n";
	public static final String CR_REPLACER = "\\r";
	
	public static String nomarlize(String target) {

		if (target == null) return "";
		
		target = target.trim(); // remove leading and tailing spaces
		
		if (target.contains(SPACE)) {
			target = replaceSpaces(target, null);
		}
		
		if (target.contains(DOUBLE_QUOTE)) {
			target = replaceDoubleQuotes(target, null);
		}
		
		if (target.contains(NEW_LINE)) {
			target = replaceNewLine(target, null);
		}
		
		if (target.contains(CR)) {
			target = replaceCR(target, null);
		}
		
		return target;
	}
	
	public static String replaceCR(String target, String replacer) {
		if (replacer == null) {
			return target.replace(CR, CR_REPLACER);
		} else {
			return target.replace(CR, replacer);
		}
	}
	
	public static String replaceNewLine(String target, String replacer) {
		if (replacer == null) {
			return target.replace(NEW_LINE, NEW_LINE_REPLACER);
		} else {
			return target.replace(NEW_LINE, replacer);
		}
	}
	
	public static String replaceDoubleQuotes(String target, String replacer) {
		if (replacer == null) {
			return target.replace(DOUBLE_QUOTE, SINGLE_QUOTE);
		} else {
			return target.replace(DOUBLE_QUOTE, replacer);
		}
	}
	
	public static String replaceSpaces(String target, String replacer) {
		if (replacer == null) {
			return target.replace(SPACE, SPACE_REPLACER);
		} else {
			return target.replace(SPACE, replacer);
		}
	}
}
