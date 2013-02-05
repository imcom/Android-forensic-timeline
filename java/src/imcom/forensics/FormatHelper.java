package imcom.forensics;

public abstract class FormatHelper {

	private String format_name;
	private char separator;
	
	public FormatHelper(String helper_name, char separator) {
		this.format_name = helper_name;
		this.separator = separator;
	}
	
	public abstract String formatString(String... targets);
	
	public String getFormatName() {
		return this.format_name;
	}
	
	public char getSeparator() {
		return this.separator;
	}
}
