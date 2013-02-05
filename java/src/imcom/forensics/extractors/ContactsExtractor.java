package imcom.forensics.extractors;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.util.Log;
import imcom.forensics.EscapeWrapper;
import imcom.forensics.FormatHelper;

public class ContactsExtractor extends GenericExtractor {

	public ContactsExtractor(String extractor_name/*, String investigation,
			String tag*/) {
		super(extractor_name/*, investigation, tag*/);
		// TODO Auto-generated constructor stub
		
		this.projection = new String[] {
				ContactsContract.Contacts._ID,
				ContactsContract.Contacts.DISPLAY_NAME,
				//ContactsContract.Contacts.CONTACT_PRESENCE,
				ContactsContract.Contacts.CONTACT_STATUS,
				ContactsContract.Contacts.CONTACT_STATUS_LABEL,
				//ContactsContract.Contacts.CONTACT_STATUS_RES_PACKAGE,
				ContactsContract.Contacts.CONTACT_STATUS_TIMESTAMP,
				ContactsContract.Contacts.LAST_TIME_CONTACTED,
				//ContactsContract.Contacts.PHOTO_ID,
				ContactsContract.Contacts.STARRED,
				//ContactsContract.Contacts.TIMES_CONTACTED,
		};
	}
	
	public void setFormat(FormatHelper helper) {
		this.helper = helper;
	}
	
	public String getFormatHelper() {
		return helper.getFormatName();
	}
	
	@Override
	public int extract(ContentResolver resolver, Context context, File dst_dir) {
		// TODO Auto-generated method stub
		Cursor cursor = null;
		BufferedWriter record_writer = null;
		Log.d(LOG_TAG, extractor_name + " launches");
		if (helper != null && uri != null) {
			cursor = resolver.query(uri, projection, selection, selection_args, sort_order);
			Log.d(LOG_TAG, extractor_name + "'s done query, " + cursor.getCount() + " items");
		} else {
			Log.d(LOG_TAG, "URI or Format not set");
			return -1;
		}
		if (cursor != null && cursor.moveToFirst()) {
			try {
				//SDWriter sd_writer = new SDWriter(context);
				record_writer = new BufferedWriter(
						new FileWriter(
								new File(
										dst_dir,
										//sd_writer.getStorageDirectory(investigation, tag),
										extractor_name + ".pjson")
								)
						);
				String[] col_names = cursor.getColumnNames();
				int records_num = cursor.getCount();
				int col_num = cursor.getColumnCount();
				do {
					StringBuilder contact_info = new StringBuilder();
					int person_id = cursor.getInt(0);
					for (int index = 0; index < col_num; ++index) {
						String field_value = EscapeWrapper.nomarlize(cursor.getString(index));
						String formatted_field = helper.formatString(col_names[index], field_value);
						contact_info.append(formatted_field);
						contact_info.append(" ");
					}
					// retrieve phone numbers of contact
					Cursor phone_cursor = resolver.query(
							ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
							null, 
							ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = " + person_id, 
							null, 
							null
							);
					if (phone_cursor != null) {
						try {
							while (phone_cursor.moveToNext()) {
								int phone_number_index = phone_cursor.getColumnIndex(
										ContactsContract.CommonDataKinds.Phone.NUMBER
										);
								String phone_number = EscapeWrapper.nomarlize(
										phone_cursor.getString(phone_number_index)
										);
								String formatted_field = helper.formatString("phone_number", phone_number);
								contact_info.append(formatted_field);
								contact_info.append(" ");
							}
						} finally {
							if (phone_cursor != null) phone_cursor.close();
						}
					}
					// retrieve email address of contact
					Cursor email_cursor = resolver.query(
							ContactsContract.CommonDataKinds.Email.CONTENT_URI, 
							null, 
							ContactsContract.CommonDataKinds.Email.CONTACT_ID + " = " + person_id,  
							null, 
							null
							);
					if (email_cursor != null) {
						try {
							while (email_cursor.moveToNext()) {
								int email_addr_index = email_cursor.getColumnIndex(
										ContactsContract.CommonDataKinds.Email.DATA
										);
								String email = EscapeWrapper.nomarlize(
										email_cursor.getString(email_addr_index)
										);
								String formatted_field = helper.formatString("email", email);
								contact_info.append(formatted_field);
								contact_info.append(" ");
							}
						} finally {
							if (email_cursor != null) email_cursor.close();
						}
					}
					String contact_record = contact_info.toString().trim();
					//TODO consider adding photo retrieval
					record_writer.write(contact_record);
					if (!cursor.isLast()) record_writer.newLine();
				} while (cursor.moveToNext());
				
				if (record_writer != null) record_writer.close();
				Log.d(LOG_TAG, extractor_name + " - fetches " + records_num + " records");
				return records_num;
			
			/*} catch (TimelineException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return -1;*/
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return -1;
			} finally {
				if (cursor != null) cursor.close();
			}
			
		} else {
			Log.d(LOG_TAG, "Empty query... Query uri: " + uri);
			return -1;
		}
		
	}

	@Override
	public void setContentUri(Uri uri) {
		// TODO Auto-generated method stub
		this.uri = uri;
	}

	@Override
	public void setProjection(String[] projection) {
		// TODO Auto-generated method stub
		this.projection = projection;
	}

	@Override
	public String[] getProjection() {
		// TODO Auto-generated method stub
		return this.projection;
	}

	@Override
	public Uri getContentUri() {
		// TODO Auto-generated method stub
		return this.uri;
	}

	@Override
	public String getExtractorName() {
		// TODO Auto-generated method stub
		return this.extractor_name;
	}

	@Override
	public void setSelection(String selection) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setSelectionArgs(String selection_args[]) {
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

}
