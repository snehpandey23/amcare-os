import Foundation
import Vision
import AppKit

guard CommandLine.arguments.count > 1 else {
    fputs("usage: siya_faces <image>\n", stderr)
    exit(2)
}
let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let img = NSImage(contentsOf: url),
      let tiff = img.tiffRepresentation,
      let rep = NSBitmapImageRep(data: tiff),
      let cg = rep.cgImage else {
    fputs("cannot load\n", stderr)
    exit(1)
}
let w = CGFloat(cg.width), h = CGFloat(cg.height)
let req = VNDetectFaceRectanglesRequest()
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try! handler.perform([req])
let faces = (req.results ?? []).map { obs -> String in
    // Vision: origin bottom-left, normalized
    let r = obs.boundingBox
    let x0 = r.origin.x * w
    let y0 = (1 - r.origin.y - r.height) * h
    let x1 = x0 + r.width * w
    let y1 = y0 + r.height * h
    return String(format: "%.1f,%.1f,%.1f,%.1f", x0, y0, x1, y1)
}
print(faces.joined(separator: ";"))
