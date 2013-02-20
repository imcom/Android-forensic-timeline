# iso8601.py - iso8601 parsing
# Copyright (C) 2012 Accellion, Inc.
#
# This library is free software; you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as
# published by the Free Software Foundation; version 2.1.
#
# This library is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
# 02110-1301 USA
"""Parse utilities for iso8601 encoding.

Whereas iso8601 encoding is offered by
:func:`datetime.datetime.isoformat`, the standard library offers no
means to decode an iso8601 format datetime into a
:class:`datetime.datetime` object.  This module just makes up for that
deficiency in an unobtrusive way.

.. codeauthor:: Evan Buswell <evan.buswell@accellion.com>
"""

import re
import datetime

ISO8601_YEAR_RE = r'(?P<year>[\+-]?\d{4})'
ISO8601_MONTH_RE = r'(?P<month>0[1-9]|1[0-2])'
ISO8601_DAY_RE = r'(?P<day>0[1-9]|[12]\d|3[0-1])'
ISO8601_HOUR_RE = r'(?P<hour>[01]\d|2[0-4])'
ISO8601_MINUTE_RE = r'(?P<minute>[0-5]\d)'
ISO8601_SECOND_RE = r'(?P<second>[0-5]\d|60)' # account for leap seconds
ISO8601_MICROSECOND_RE = r'(?P<microsecond>\.\d+)'
ISO8601_TZ_RE = r'(?P<timezone>Z|[\+-](?:0[0-9]|1[0-2]))'
ISO8601_RE = re.compile(r'\A' + ISO8601_YEAR_RE
                        + r'(?:'+ r'(?P<datesep>-?)' + ISO8601_MONTH_RE
                            + r'(?:' + r'(?P=datesep)' + ISO8601_DAY_RE
                            + r')?'
                        + r')?'
                        + r'(?:T' + ISO8601_HOUR_RE
                            + r'(?:' + r'(?P<timesep>:?)' + ISO8601_MINUTE_RE
                                + r'(?:' + r'(?P=timesep)' + ISO8601_SECOND_RE
                                    + r'(?:' + ISO8601_MICROSECOND_RE
                                    + r')?'
                                + r')?'
                            + r')?'
                        + r')?'
                        + ISO8601_TZ_RE + '?'
                        + r'\Z')
"""Regular expression for an iso8601 encoded date, to be used for
validation or manual parsing."""

def parse_datetime(string):
    """Parse an iso8601-encoded datetime string.

    Args:
       ``string``: an iso8601 datetime string.

    Returns:
       A :class:`datetime.datetime` object.

    Raises:
       ``ValueError``: Could not parse the provided string.
    """
    m = ISO8601_RE.match(string)
    if m is None:
        raise ValueError("Could not parse '%s'" % string)

    year = int(m.group('year'))
    month = int(m.group('month')) if m.group('month') is not None else 1
    day = int(m.group('day')) if m.group('day') is not None else 1
    hour = int(m.group('hour')) if m.group('hour') is not None else 0
    minute = int(m.group('minute')) if m.group('minute') is not None else 0
    second = int(m.group('second')) if m.group('second') is not None else 0
    if m.group('microsecond') is not None:
        microsecond = m.group('microsecond')
        microsecond = microsecond[0:6] # maximum of 999999
        microsecond = '{:0<6}'.format(microsecond)
        microsecond = int(float(microsecond) * 1000000)
    else:
        microsecond = 0
    ret = datetime.datetime(year, month, day, hour, minute, second, microsecond)
    if m.group('timezone') and m.group('timezone') != 'Z':
        ret -= timedelta(hours=int(m.group('timezone')))
    return ret
