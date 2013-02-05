package imcom.forensics;

public class TimelineException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3577824906677255982L;

	public TimelineException(String msg, Exception ex) {
		super(msg, ex);
	}
	
	public TimelineException(String msg) {
		super(msg);
	}
}
