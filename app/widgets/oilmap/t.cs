public void ProcessRequest(HttpContext context)
  {
    HttpResponse response = context.Response;
    
    string uri = context.Request.Url.Query.Substring(1);
    if (this.checkDomain(uri)
    {
      //System.Net.WebRequest req = System.Net.WebRequest.Create(context.Request["u"]);
      //if (req is System.Net.HttpWebRequest)
       // ((System.Net.HttpWebRequest)req).UserAgent = context.Request.UserAgent;
      System.Net.HttpWebRequest req = (System.Net.HttpWebRequest)System.Net.HttpWebRequest.Create(uri);
      req.ContentType = context.Request.ContentType;
      req.Method = context.Request.HttpMethod;

      int nRead = 0;
      byte[] baBuffer = new byte[BUFF_SIZE];
      if (req.Method == "POST")
      {
        int nTmp = 0;
        while (nTmp < context.Request.ContentLength)
        {
          nRead = context.Request.InputStream.Read(baBuffer, 0, BUFF_SIZE);
          if (nRead > 0)
          {
            req.GetRequestStream().Write(baBuffer, 0, nRead);
            nTmp += nRead;
          }
        }
        req.GetRequestStream().Flush();
        req.GetRequestStream().Close();
      }

      System.Net.WebResponse resp = req.GetResponse();
      context.Response.ContentType = resp.ContentType;
      System.IO.Stream strm = resp.GetResponseStream();
      nRead = strm.Read(baBuffer, 0, BUFF_SIZE);
      System.IO.Stream strmOut = context.Response.OutputStream;
      
      context.Response.AppendHeader("Access-Control-Allow-Origin", "*");
      context.Response.AppendHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
      
      while (nRead != 0)
      {
        strmOut.Write(baBuffer, 0, nRead);
        nRead = strm.Read(baBuffer, 0, BUFF_SIZE);
      }

      strmOut.Flush();
      strmOut.Close();
    }
    else
    {
      context.Response.ContentType = "text/plain";
      context.Response.Write("That domain is not allowed to be proxied.");
    }
  }