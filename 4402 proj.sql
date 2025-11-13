-- Create Database
CREATE DATABASE MusicStore;
GO

USE MusicStore;
GO

-- Table: Formats
CREATE TABLE Formats (
    FormatID INT IDENTITY(1,1) PRIMARY KEY,
    FormatName NVARCHAR(50) NOT NULL
);
GO

-- break

INSERT INTO Formats (FormatName)
VALUES ('Vinyl'), ('CD'), ('Cassette');
GO

-- Table: Products
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(100) NOT NULL,
    Artist NVARCHAR(100) NOT NULL,
    ReleaseDate DATE,
    Genre NVARCHAR(50),
    Label NVARCHAR(50),
    Price DECIMAL(10, 2) NOT NULL
);
GO

-- Table: Inventory
CREATE TABLE Inventory (
    InventoryID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    FormatID INT NOT NULL,
    Quantity INT DEFAULT 0,
    SKU NVARCHAR(50) UNIQUE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (FormatID) REFERENCES Formats(FormatID)
);
GO



-- filler data 
INSERT INTO Products (Title, Artist, ReleaseDate, Genre, Label, Price)
VALUES 
('The Dark Side of the Moon', 'Pink Floyd', '1973-03-01', 'Rock', 'Harvest', 29.99),
('Thriller', 'Michael Jackson', '1982-11-30', 'Pop', 'Epic', 19.99),
('Nevermind', 'Nirvana', '1991-09-24', 'Grunge', 'DGC', 24.99);

-- more filler data
INSERT INTO Products (Title, Artist, ReleaseDate, Genre, Label, Price)
VALUES
('Rumours', 'Fleetwood Mac', '1977-02-04', 'Rock', 'Warner Bros.', 27.99),
('Back in Black', 'AC/DC', '1980-07-25', 'Hard Rock', 'Atlantic', 25.99),
('Abbey Road', 'The Beatles', '1969-09-26', 'Classic Rock', 'Apple', 28.99),
('21', 'Adele', '2011-01-24', 'Pop', 'XL Recordings', 22.49),
('To Pimp a Butterfly', 'Kendrick Lamar', '2015-03-15', 'Hip-Hop', 'Top Dawg', 24.99),
('1989', 'Taylor Swift', '2014-10-27', 'Pop', 'Big Machine', 21.99),
('Hybrid Theory', 'Linkin Park', '2000-10-24', 'Nu Metal', 'Warner Bros.', 23.99),
('Kind of Blue', 'Miles Davis', '1959-08-17', 'Jazz', 'Columbia', 26.49),
('Random Access Memories', 'Daft Punk', '2013-05-17', 'Electronic', 'Columbia', 27.49),
('Born to Run', 'Bruce Springsteen', '1975-08-25', 'Rock', 'Columbia', 24.49),
('The Eminem Show', 'Eminem', '2002-05-26', 'Hip-Hop', 'Aftermath', 23.49),
('Led Zeppelin IV', 'Led Zeppelin', '1971-11-08', 'Rock', 'Atlantic', 26.99),
('Hotel California', 'Eagles', '1976-12-08', 'Rock', 'Asylum', 25.49),
('OK Computer', 'Radiohead', '1997-05-21', 'Alternative', 'Parlophone', 24.99),
('Nevermind the Bollocks', 'Sex Pistols', '1977-10-28', 'Punk', 'Virgin', 22.99);

INSERT INTO Inventory (ProductID, FormatID, Quantity, SKU)
VALUES
(1, 1, 15, 'VINYL-001'),
(1, 2, 10, 'CD-001'),
(2, 2, 25, 'CD-002'),
(3, 3, 5, 'CAS-001');


INSERT INTO Inventory (ProductID, FormatID, Quantity, SKU)
VALUES
(4, 1, 12, 'VINYL-004'), (4, 2, 8, 'CD-004'),
(5, 1, 20, 'VINYL-005'), (5, 2, 15, 'CD-005'), (5, 3, 5, 'CAS-005'),
(6, 2, 30, 'CD-006'), (6, 3, 10, 'CAS-006'),
(7, 1, 18, 'VINYL-007'), (7, 2, 20, 'CD-007'),
(8, 2, 25, 'CD-008'),
(9, 1, 10, 'VINYL-009'), (9, 2, 12, 'CD-009'),
(10, 2, 10, 'CD-010'),
(11, 1, 15, 'VINYL-011'), (11, 2, 25, 'CD-011'),
(12, 3, 5, 'CAS-012'),
(13, 1, 8, 'VINYL-013'), (13, 2, 10, 'CD-013'),
(14, 1, 12, 'VINYL-014'), (14, 2, 8, 'CD-014'),
(15, 2, 14, 'CD-015'),
(16, 1, 9, 'VINYL-016'), (16, 2, 7, 'CD-016'),
(17, 1, 10, 'VINYL-017'), (17, 3, 6, 'CAS-017'),
(18, 1, 5, 'VINYL-018'), (18, 2, 4, 'CD-018');

-- test for data insertion
SELECT TOP 3* FROM Products;

select * from inventory


