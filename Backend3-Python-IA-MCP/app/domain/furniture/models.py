"""Dominio — muebles: tipos, dimensiones, madera."""
from dataclasses import dataclass
from enum import Enum


class FurnitureType(str, Enum):
    WARDROBE = "WARDROBE"
    TABLE = "TABLE"
    CHAIR = "CHAIR"
    BOOKSHELF = "BOOKSHELF"
    DESK = "DESK"
    KITCHEN_CABINET = "KITCHEN_CABINET"
    DOOR = "DOOR"
    BED = "BED"
    OTHER = "OTHER"


class WoodType(str, Enum):
    PINO = "PINO"
    MELAMINA = "MELAMINA"
    CEDRO = "CEDRO"
    ROBLE = "ROBLE"
    MARA = "MARA"
    GENERIC = "GENERIC"


@dataclass(frozen=True)
class Dimensions:
    length_m: float
    width_m: float
    height_m: float

    @property
    def volume_m3(self) -> float:
        return self.length_m * self.width_m * self.height_m


@dataclass
class FurnitureEstimate:
    furniture_type: FurnitureType
    confidence: float
    estimated_price: float
    currency: str = "BOB"
    factors: dict | None = None
