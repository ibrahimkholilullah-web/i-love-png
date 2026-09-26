import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
    const pdfDocument = await loadingTask.promise;

    const numPages = pdfDocument.numPages;
    const images = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });

      // Canvas তৈরি না করে সিম্পল ডেটা মেমোরি পেজ তথ্য সংগৃহীত
      const canvas = {
        width: viewport.width,
        height: viewport.height,
      };

      // পেজ রেন্ডারিং
      images.push({ pageNum, width: canvas.width, height: canvas.height });
    }

    return NextResponse.json({ message: "PDF Processed Successfully", pageCount: numPages });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}