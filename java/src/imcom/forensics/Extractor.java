package imcom.forensics;

import java.io.File;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;

public interface Extractor {
	
	static final String LOG_TAG = "IMCOM-Extractor";
	
	public int extract(ContentResolver resolver, Context context, File dst_dir);
	
	public void setContentUri(Uri uri);
	
	public void setProjection(String[] projection);
	
	public void setSelection(String selection);
	
	public void setSelectionArgs(String selection_args[]);
	
	public void setSortOrder(String sort_order);
	
	public String getSelection();
	
	public String[] getSelectionArgs();
	
	public String getSortOrder();
	
	public String[] getProjection();
	
	public Uri getContentUri();
	
	public String getExtractorName();
	
	public void setFormat(FormatHelper helper);
	
	public String getFormatHelper();
}
