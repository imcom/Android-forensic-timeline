package imcom.forensics.extractors;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.util.Log;
import imcom.forensics.EscapeWrapper;
import imcom.forensics.Extractor;
import imcom.forensics.FormatHelper;

public abstract class GenericExtractor implements Extractor {
	protected final String extractor_name;

	protected Uri uri;
	protected String selection;
	protected String[] selection_args;
	protected String sort_order;
	protected String[] projection;
	protected FormatHelper helper;
	
	public GenericExtractor(String extractor_name) {
		this.extractor_name = extractor_name;

		this.uri = null;
		this.selection = null;
		this.selection_args = null;
		this.sort_order = null;
		this.projection = null;
	}
	
	public int extract(ContentResolver resolver, Context context, File dst_dir) {
		Log.d(LOG_TAG, extractor_name + " launches");
		Cursor cursor = null;
		BufferedWriter record_writer = null;
		
		if (helper != null && uri != null) {
			cursor = resolver.query(uri, projection, selection, selection_args, sort_order);
			Log.d(LOG_TAG, extractor_name + "'s done query, " + cursor.getCount() + " items");
		} else {
			Log.d(LOG_TAG, extractor_name + " - URI or Format not set");
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
							extractor_name + ".pjson"
						)
					)
				);
				
				String[] col_names = cursor.getColumnNames();
				int records_num = cursor.getCount();
				int col_num = cursor.getColumnCount();

				do {
					StringBuilder extracted_item = new StringBuilder();
					for (int index = 0; index < col_num; ++index) {	
						String field_value = EscapeWrapper.nomarlize(cursor.getString(index));
						String formatted_field = helper.formatString(col_names[index], field_value);
						extracted_item.append(formatted_field);
						extracted_item.append(" ");
					}
					record_writer.write(extracted_item.toString().trim());			
					if (!cursor.isLast()) record_writer.newLine();
					
				} while (cursor.moveToNext());

				if (record_writer != null) record_writer.close();
				
				Log.d(LOG_TAG, extractor_name + " - fetches " + records_num + " records");
				return records_num;

				/*} catch (TimelineException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				Log.e(LOG_TAG, e.getMessage());
				return -1;*/
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				Log.e(LOG_TAG, e.getMessage());
				return -1;
			} finally {
				if (cursor != null) cursor.close();
			}
		} else {
			Log.d(LOG_TAG, extractor_name + " - Empty query... Query uri: " + uri);
			return -1;
		}
	}
}
