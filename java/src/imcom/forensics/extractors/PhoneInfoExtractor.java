package imcom.forensics.extractors;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.telephony.TelephonyManager;
import android.util.Log;

import imcom.forensics.EscapeWrapper;
import imcom.forensics.Extractor;
import imcom.forensics.FormatHelper;

public class PhoneInfoExtractor implements Extractor {

	private String extractor_name;
	private FormatHelper helper;
	//private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddkkmm", Locale.US);
	
	public PhoneInfoExtractor(String extractor_name) {
		this.extractor_name = extractor_name;
	}
	
	@Override
	public int extract(ContentResolver resolver, Context context, File dst_dir) {
		// content resolver is unused here
		Log.d(LOG_TAG, extractor_name + " launches");
		try {
			TelephonyManager telephony_manager = (TelephonyManager) context.getSystemService(
					Context.TELEPHONY_SERVICE
					);
			//String date = dateFormat.format(new Date());
			BufferedWriter writer = new BufferedWriter(
					new FileWriter(
							new File(dst_dir, this.getExtractorName() + ".pjson")
							)
					);
			if (telephony_manager != null) {
				//writer.write(helper.formatString("investigation_date", date));
				//writer.newLine();
				//Log.d(LOG_TAG, telephony_manager.getSubscriberId());
				writer.write(helper.formatString("IMSI", telephony_manager.getSubscriberId()));
				writer.write(" ");
				writer.write(helper.formatString("IMEI", telephony_manager.getDeviceId()));
				writer.write(" ");
				writer.write("PHONE_TYPE:" + telephony_manager.getPhoneType());
				writer.write(" ");
				writer.write(helper.formatString("MSISDN", telephony_manager.getLine1Number()));
				writer.write(" ");
				writer.write(helper.formatString("ICCID", telephony_manager.getSimSerialNumber()));
				writer.write(" ");
			} else {
				Log.d(LOG_TAG, extractor_name + " - Failed to get Telephony manager");
			}
			//writer.write("version_release:" + Build.VERSION.RELEASE + " ");
			//writer.write("version_sdk:" + Build.VERSION.SDK + " ");
			//writer.write("version_incremental:" + Build.VERSION.INCREMENTAL + "\n");
			writer.write("board:" + Build.BOARD + " ");
			writer.write("brand:" + Build.BRAND + " ");
			writer.write("device:" + Build.DEVICE + " ");
			writer.write("display:" + Build.DISPLAY + " ");
			writer.write(helper.formatString("fingerprint", Build.FINGERPRINT));
			writer.write(" ");
			writer.write(helper.formatString("host", EscapeWrapper.replaceSpaces(Build.HOST, null)));
			writer.write(" ");
			writer.write("id:" + Build.ID + " ");
			writer.write(helper.formatString("model", EscapeWrapper.replaceSpaces(Build.MODEL, null)));
			writer.write(" ");
			//writer.write("product:" + Build.PRODUCT + "\n");
			//writer.write("tags:" + Build.TAGS + "\n");
			writer.write("time:" + Build.TIME + " ");
			//writer.write("type:" + Build.TYPE + "\n");
			writer.write(helper.formatString("user", EscapeWrapper.replaceSpaces(Build.USER, null)));

			if (writer != null) writer.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return 1;
	}

	@Override
	public void setContentUri(Uri uri) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setProjection(String[] projection) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setSelection(String selection) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setSelectionArgs(String[] selection_args) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setSortOrder(String sort_order) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getSelection() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String[] getSelectionArgs() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getSortOrder() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String[] getProjection() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Uri getContentUri() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getExtractorName() {
		// TODO Auto-generated method stub
		return this.extractor_name;
	}

	@Override
	public void setFormat(FormatHelper helper) {
		// TODO Auto-generated method stub
		this.helper = helper;
	}

	@Override
	public String getFormatHelper() {
		// TODO Auto-generated method stub
		return null;
	}

}
